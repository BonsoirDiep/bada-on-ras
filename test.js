var SerialPort = require('serialport');

SerialPort.list(function (err, ports) {
    if(err) return console.log('Error get list ports: ', err.message);
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });
});