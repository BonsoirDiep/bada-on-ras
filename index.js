var firebase = require('firebase');

var app = firebase.initializeApp({
    apiKey: "AIzaSyAQjPEurq2EePfkHTwlcV-2z9DUfDo0V6c",
    authDomain: "badaiots-kz.firebaseapp.com",
    databaseURL: "https://badaiots-kz.firebaseio.com",
    projectId: "badaiots-kz",
    storageBucket: "badaiots-kz.appspot.com",
    messagingSenderId: "557393741006"
});
var db = firebase.database();
var delayMs = 2000;
var listSensors = []; // update each delayMs ms
var listLights = []; // listen data event

var productKey = 'hFrPLqQKIbmU';
var a = db.ref('product/'+productKey+'/kit');
a.on("child_added", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    if(b.startsWith('node')){
        listLights.push(b);
    } else if(b == 'sens'){
        var c = snapshot.val();
        c.split(';').forEach(e=>{
            if(e) listSensors.push('node'+e);
        })
    }
});

a.on("child_removed", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    if(b.startsWith('node')){
        listLights.pop(b);
    } else if(b == 'sens'){
        var c = snapshot.val();
        console.log(c);
        c.split(';').forEach(e=>{
            if(e) listSensors.pop('node'+e);
        })
    }
});

a.on("child_changed", function(snapshot, prevChildKey) {
    var b = snapshot.key;
    if(b.startsWith('node')){
        var c = snapshot.val();
        console.log(b,c); // thao tác xuất giá trị ra chân GPIO
    }
});
