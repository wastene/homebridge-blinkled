homebridge-blinkled
===================
Homebridge-Plugin to blink LED's with GPIO-Pins of the Rasperry Pi.

## Install

```console
 npm install homebridge-blinkled
```


## Usage


Pin1 and Pin2 are the two pins which to blink.

The minInterval is the minimum of the blink Interval. When you set it to 1 it would be this value.

The maxInterval is the maximum of the blink Interval. When you set it to 100 it would be this value.

config.json sample:

```json
"accessories": [
   {
       "accessory": "blinkLED",
       "name": "Blink",
       "pin1": 18,
       "pin2": 23,
       "minInterval": 100,
       "maxInterval": 2000
   }
]
```

This Plugin use the "rpio" - Module from "jperkin":

https://www.npmjs.com/package/rpio
https://github.com/jperkin/node-rpio
