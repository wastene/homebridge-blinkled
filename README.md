homebridge-blinkled
===================
Homebridge-Plugin to blink LED's with GPIO-Pins of the Rasperry Pi.

https://www.npmjs.com/package/homebridge-blinkled  

## Install

```console
 npm install homebridge-blinkled
```


## Usage


The pins-variable is a array of pins. Put the pins which should blink in this array.

The minInterval is the minimum of the blink Interval. When you set it to 1 it would be this value.

The maxInterval is the maximum of the blink Interval. When you set it to 100 it would be this value.

For mapping there are 2 alternatives. The first, the default one is "gpio" and the other is "physical".

config.json sample:

```json
"accessories": [
   {
	"accessory": "blinkLED",
	"name": "Blink",
	"pins": [18, 19, 20],
	"minInterval": 100,
	"maxInterval": 2000,
	"mapping": "gpio"
   }
]
```

## Other Information

My Homepage:  

http://a-berisha.de


This Plugin use the "rpio" - Module from "jperkin":

https://www.npmjs.com/package/rpio  
https://github.com/jperkin/node-rpio
