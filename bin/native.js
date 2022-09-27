"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i2c_1 = __importDefault(require("i2c"));
const wire = new i2c_1.default(0x5c, { device: '/dev/i2c-1', });
wire.write([0x03, 0x00, 0x05], function (err) { });
wire.read(8, function (err, res) {
    console.dir(res);
});
// function I2C_DHT12(log, config) {
//     this.log = log;
//     this.name = config.name;
//     this.i2cAddress = parseInt(config.i2cAddress);
//     this.i2cDevice = config.i2cDevice || '/dev/i2c-1';
//     this.updateFrequency = config.updateFrequency || 60;
//     this.wire = new i2c(this.i2cAddress, {
//         device: this.i2cDevice
//     });
//     this.services = {};
//     this.cache = {
//         temperature: 0,
//         humditiy: 0,
//         fault: Characteristic.StatusTampered.TAMPERED
//     };
// }
// I2C_DHT12.prototype = {
//     /** Required Functions **/
//     identify: function(callback) {
//         this.log('Identify requested!');
//         callback();
//     },
//     getServices: function() {
//         this.services.informationService = new Service.AccessoryInformation();
//         this.services.informationService
//             .setCharacteristic(Characteristic.Manufacturer, 'Henry Spanka')
//             .setCharacteristic(Characteristic.Model, 'I2C DHT12 Temperature & Humidity Sensor')
//             .setCharacteristic(Characteristic.SerialNumber, this.name);
//         this.log('creating Temperature & Humidity Sensor');
//         this.services.tempSensorService = new Service.TemperatureSensor(this.name);
//         this.services.tempSensorService
//             .getCharacteristic(Characteristic.CurrentTemperature)
//             .on('get', this.getTemperature.bind(this))
//             .setProps({
//                 minValue: -30
//             });
//         this.services.tempSensorService
//             .getCharacteristic(Characteristic.StatusTampered)
//             .on('get', this.getFault.bind(this));
//         this.services.humiditySensorService = new Service.HumiditySensor(this.name);
//         this.services.humiditySensorService
//             .getCharacteristic(Characteristic.CurrentRelativeHumidity)
//             .on('get', this.getHumidity.bind(this));
//         this.services.humiditySensorService
//             .getCharacteristic(Characteristic.StatusTampered)
//             .on('get', this.getFault.bind(this));
//         this.readData();
//         setInterval(this.readData.bind(this), this.updateFrequency * 1000);
//         return [this.services.informationService, this.services.tempSensorService, this.services.humiditySensorService];
//     },
//     getTemperature: function(callback) {
//         callback(null, this.cache.temperature);
//     },
//     getHumidity: function(callback) {
//         callback(null,  this.cache.humidity);
//     },
//     getFault: function(callback) {
//         callback(null, this.cache.fault);
//     },
//     setFault: function(value) {
//         this.cache.fault = value;
//     },
//     readData: function() {
//         this.wire.readBytes(0x00, 5, function(error, res) {
//             if (error) {
//                 this.log(error);
//                 this.setFault(Characteristic.StatusTampered.TAMPERED);
//             } else {
//                 let humidity_higher = res[0];
//                 let humidity_lower = res[1];
//                 this.cache.humidity = Math.round(humidity_higher + humidity_lower / 10);
//                 let temp_higher = res[2];
//                 let temp_lower = res[3] & parseInt("7f", 16);
//                 if (res[3] & parseInt("80", 16)) {
//                     temp_higher = -temp_higher;
//                     temp_lower = -temp_lower;
//                 }
//                 this.cache.temperature = (Math.round((temp_higher + (temp_lower / 10)) * 2) / 2).toFixed(1);
//                 let checksum = res[0] + res[1] + res[2] + res[3];
//                 if (checksum != res[4]) {
//                     this.setFault(Characteristic.StatusTampered.TAMPERED);
//                 } else {
//                     this.setFault(Characteristic.StatusTampered.NOT_TAMPERED);
//                 }
//             }
//             this.updateData();
//         }.bind(this));
//     },
//     updateData: function() {
//         this.services.tempSensorService
//             .getCharacteristic(Characteristic.CurrentTemperature)
//             .updateValue(this.cache.temperature);
//         this.services.tempSensorService
//             .getCharacteristic(Characteristic.StatusTampered)
//             .updateValue(this.cache.fault);
//         this.services.humiditySensorService
//             .getCharacteristic(Characteristic.CurrentRelativeHumidity)
//             .updateValue(this.cache.humidity);
//         this.services.humiditySensorService
//             .getCharacteristic(Characteristic.StatusTampered)
//             .updateValue(this.cache.fault);
//     }
// };
//# sourceMappingURL=native.js.map