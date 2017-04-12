var rpio = require("rpio");
var fs = require("fs");
var Service, Characteristic;
var pathPinSuf = ".pin";

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-blinkled", "blinkLED", BlinkLEDAccessory);
}

function BlinkLEDAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"] || "Blink";
  this.minI = config["minInterval"] || 100;
  this.maxI = config["maxInterval"] || 2000;
  this.map = config["mapping"] || "gpio";
  this.pins = config["pins"];
  
  if(this.pins.length<=0){
	  throw "No pins are found.";
  }
  
  this.minI = parseInt(this.minI);
  this.maxI = parseInt(this.maxI);
  
  
  if(this.map != "physical" && this.map != "gpio"){
	  this.map = "gpio";
  }
  
 
  this.blinkT = 0;     //Interval in ms
  this.blinkOn = 0;    //Status of Blink (on/off)
  this.timerid = 0;    //Timer-ID for Blink-Interval
  this.oneTime = 0;    //First Pass? Then initialize Interval

  this.differ = this.maxI - this.minI;
  this.blinkT = (this.differ/2) + this.minI;  //Initialize with 50%

  rpio.init({mapping: this.map});
  
  this.service = new Service.Lightbulb(this.name);

  this.service
    .getCharacteristic(Characteristic.On)
    .on('get', this.getOn.bind(this))
    .on('set', this.setOn.bind(this));

  this.service
    .addCharacteristic(new Characteristic.Brightness())
    .on('get', this.getBlink.bind(this))
    .on('set', this.setBlink.bind(this));


  initPins(this.pins);

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
 	   var doCall = function(allPins,bool, time, blinkState) {
	      return setInterval(function(){blink(allPins,bool,blinkState);bool=!bool;blinkState++; if(blinkState>=allPins.length){blinkState=0;}}, time); 
           }
	   this.timerId = doCall(this.pins,false, this.blinkT, 0);
	   this.log("Start Interval in setOn");
	   this.oneTime=1;
	}
  }else {
        clearInterval(this.timerId);
		this.log("clearInterval in setOn");
        this.oneTime=0;
        writeState(this.pins, 0);
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
     var doCall = function(allPins,bool, time, blinkState){
          return setInterval(function(){ blink(allPins, bool, blinkState); bool=!bool;blinkState++; if(blinkState>=allPins.length){blinkState=0;} }, time);
     }
     if(this.oneTime==1){
       	  clearInterval(this.timerId);
     }else {
     	  this.oneTime=1;
     }
	 this.timerId = doCall(this.pins ,false, this.blinkT,0);
  }
  callback(null);
}
function initPins(pinArr){
	for(var i=0; i<pinArr.length; i++){
	  rpio.open(pinArr[i],rpio.OUTPUT);
	}
}
function writeState(pinArr, on){
	for(var i=0; i<pinArr.length; i++){
	  rpio.write(pinArr[i], on);
	}
}
function blink(pins,  bool, blinkState){ 
  if(bool)
	  bool = 1;
  else
	  bool = 0;
  writeState(pins, 0);
  rpio.write(pins[blinkState], 1);

}

