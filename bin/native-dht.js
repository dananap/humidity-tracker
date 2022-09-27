"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dht_sensor_1 = __importDefault(require("node-dht-sensor"));
node_dht_sensor_1.default.read(22, 2, function (err, temperature, humidity) {
    if (!err) {
        console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
    }
});
//# sourceMappingURL=native-dht.js.map