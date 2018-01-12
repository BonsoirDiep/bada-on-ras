var firebase = require('firebase');
var SerialPort = require('serialport');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

var config = require("./config.json");

var portName = config.portName; // examples: '/dev/tty-usbserial1', 'COM5', '/dev/ttyUSB0';
// portName can found with command: 'npm run test'
var port = new SerialPort(portName, {
    baudRate: 9600
});



var productKey = config.productKey; // note: 'hFrPLqQKIbmU' is demo product key
if(!productKey) productKey = config.demoKey;
/**
 * initializeApp with badaiots-kz.firebaseapp.com
 */
var app = firebase.initializeApp({
    apiKey: "AIzaSyAQjPEurq2EePfkHTwlcV-2z9DUfDo0V6c",
    authDomain: "badaiots-kz.firebaseapp.com",
    databaseURL: "https://badaiots-kz.firebaseio.com",
    projectId: "badaiots-kz",
    storageBucket: "badaiots-kz.appspot.com",
    messagingSenderId: "557393741006"
});
var db = firebase.database();
var a = db.ref('product/'+productKey+'/kit');
var delayMs = 2000;
var listSensors = []; // update each delayMs ms
var listLights = []; // listen data event
var listAnalogs = []; // listen data event


var unoReady = false;
port.open(function (err) {
    if (err) {
        if(err.message == 'Port is opening'){
            console.log('Info: ', err.message);
        }
        else return console.log('Error opening port: ', err.message);
    }
    console.log(`SerialPort on ${portName} ready ...`);
});

port.on('data', function (data) {
    var humanData = decoder.write(data);
    try{
        var json = JSON.parse(humanData);
        if(json.err){
            console.log('Err: ', json.err);
        }
        else{
            db.ref(`product/${productKey}/sens`).update(json);
        }
    } catch (_err){
        console.log(_err.message);
    }
    if(humanData=='Ready\r\n'){
        unoReady = true;
    }
});

port.on('close', function () {
    console.log('Serial closed, app will exit');
    process.exit();
});
port.on('error', function(err) {
    console.log('Error: ', err.message);
    process.exit();
  })

function send2Uno(cmd){
    if(!unoReady) return;
    port.write(cmd, function(err) {
        if (err) {
        return console.log('Error on write: ', err.message);
        }
    });
}
function isONOFF(n){
    var pins = [ 2, 4, 7, 8, 12, 13];
    if(typeof(n)=='number'){
        return (pins.indexOf(n) >-1);
    } else if(typeof(n)=='string'){
        var b = parseInt(n);
        if(b.toString() === n) return (pins.indexOf(b) >-1);
    }
    
    return false;
}
function isPWM(n){
    var pins = [3, 5, 6, 9, 10, 11];
    if(typeof(n)=='number'){
        return (pins.indexOf(n) >-1);
    } else if(typeof(n)=='string'){
        var b = parseInt(n);
        if(b.toString() === n) return (pins.indexOf(b) >-1);
    }
    
    return false;
}
function isSENSOR(n){
    var pins = [ 14,15,16,17,18,19];
    if(typeof(n)=='number'){
        return (pins.indexOf(n) >-1);
    } else if(typeof(n)=='string'){
        var b = parseInt(n);
        if(b.toString() === n) return (pins.indexOf(b) >-1);
    }
    
    return false;
}
// init user design
a.on("child_added", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    var c = snapshot.val();
    
    if(b == 'lights'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e) listLights.push('node'+e);
        })
    } else if(b == 'analogs'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e) listAnalogs.push('node'+e);
        })
    } else if(b == 'sens'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e && isSENSOR(e)) listSensors.push(e);
        });
        if(listSensors.length>0){
            console.log('SENSOR: ', listSensors);
            var sensorSerialCommand = 'ai ';
            listSensors.forEach(e=>{
                sensorSerialCommand+= e+ ' ';
            })
            sensorSerialCommand+='\r\n';
            send2Uno(sensorSerialCommand);
        }

    }
});
// user rebuild designs
a.on("child_removed", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    var c = snapshot.val();
    if(b == 'lights'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e) listLights.pop('node'+e);
        })
    } else if(b == 'analogs'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e) listAnalogs.pop('node'+e);
        })
    } else if(b == 'sens'){
        if(c!=null) c.split(';').forEach(e=>{
            if(e) listSensors.pop(e);
        })
    }
});

// analog and digital output change
a.on("child_changed", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    if(b.startsWith('node')){
        var c = snapshot.val();
        if(listAnalogs.indexOf(b)>-1 && c!=null){
            b = b.replace('node','');
            if(isPWM(b)){
                c = parseInt(c);
                if(!isNaN(c)&& 0<=c && c<= 255){
                    b = 'ao '+ b+ ' ' +c+'\r\n';
                    send2Uno(b);
                }
            }
        }
        else if(listLights.indexOf(b)>-1){
            b = b.replace('node','');
            if(isONOFF(b)){
                b = 'do '+ b;
                if(c) b+= ' 1\r\n'; else b+=' 0\r\n';
                send2Uno(b);
            }
        }
        //thao tác xuất giá trị ra chân GPIO
    }
});
