var rpio = require("rpio");
var fs = require("fs");
var Service, Characteristic;
var path = "/var/homebridge/.pin";

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-blinkled", "blinkLED", BlinkLEDAccessory);
}

function BlinkLEDAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"] || "Blink";
  this.pin1 = config["pin1"] || 18;
  this.pin2 = config["pin2"] || 23;
  this.minI = config["minInterval"] || 100;
  this.maxI = config["maxInterval"] || 2000;

  this.minI = parseInt(this.minI);
  this.maxI = parseInt(this.maxI);

  this.blinkT = 0;     //Interval in ms
  this.blinkOn = 0;    //Status of Blink (on/off)
  this.timerid = 0;    //Timer-ID for Blink-Interval
  this.oneTime = 0;    //First Pass? Then initialize Interval

  this.differ = this.maxI - this.minI;
  this.blinkT = (this.differ/2) + this.minI;  //Initialize with 50%

  rpio.init({mapping: 'gpio'});
  
  this.service = new Service.Lightbulb(this.name);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getOn.bind(this))
    .on('set', this.setOn.bind(this));

  this.service
    .addCharacteristic(new Characteristic.Brightness())
    .on('get', this.getBlink.bind(this))
    .on('set', this.setBlink.bind(this));

  try {
    this.testOn1 = fs.readFileSync(path+this.pin1);
  }catch(err){
    this.log(err);
    this.testOn1 = 0;
  }
  try {
    this.testOn2 = fs.readFileSync(path+this.pin2);
  }catch(err){
    this.log(err);
    this.testOn2 = 0;
  }
  this.testOn1 = parseInt(this.testOn1);
  this.testOn2 = parseInt(this.testOn2);
  rpio.open(this.pin1, rpio.OUTPUT, this.testOn1);
  rpio.open(this.pin2, rpio.OUTPUT, this.testOn2);

}
BlinkLEDAccessory.prototype.getServices = function() {
  return[this.service];
}

BlinkLEDAccessory.prototype.getOn = function(callback){
  this.log("Led-State: "+this.blinkOn);
  callback(null, this.blinkOn);
}
BlinkLEDAccessory.prototype.setOn = function(on, callback) {
  this.log("Setting power to "+ on);
  this.blinkOn = on;
  if(this.blinkOn == 1){
	if(this.oneTime==0){
 	   var doCall = function(j,k,l, time) {
	      return setInterval(function(){blink(j,k,l);l=!l;}, time); 
           }
	   this.timerId = doCall(this.pin1,this.pin2 ,false, this.blinkT);
	   this.log("Start Interval in setOn");
	   this.oneTime=1;
	}
  }else {
        clearInterval(this.timerId);
	this.log("clearInterval in setOn");
        this.oneTime=0;
        rpio.write(this.pin1, 0);
        rpio.write(this.pin2, 0);
  }
  callback(null);
}
BlinkLEDAccessory.prototype.getBlink = function(callback){
  this.log("Setting Blink Time to "+ this.blinkT);
  callback(null, ((this.blinkT-this.minI)/this.differ)*100);
}
BlinkLEDAccessory.prototype.setBlink = function(blinkTime, callback){
  this.blinkT = (blinkTime*(this.differ/100))+this.minI;
  this.log("Setting Blink Time to " + this.blinkT);
  
  if(this.blinkOn==1){
     var doCall = function(j,k,l, time){
          return setInterval(function(){ blink(j,k, l); l=!l;}, time);
     }
     if(this.oneTime==1){
       	  clearInterval(this.timerId);
     	  this.timerId = doCall(this.pin1,this.pin2,false, this.blinkT);
     }else {
     	  this.timerId = doCall(this.pin1, this.pin2 ,false, this.blinkT);
     	  this.oneTime=1;
     }
  }
  callback(null);
}
function blink(pin1, pin2,  bool){
  if(bool){
     rpio.write(pin2, 0)
     rpio.write(pin1, 1); 
  }else{
     rpio.write(pin1, 0);
     rpio.write(pin2, 1);
  }  
}

