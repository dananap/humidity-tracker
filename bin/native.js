"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.measure = void 0;
const i2c_1 = __importDefault(require("i2c"));
const ioredis_1 = __importDefault(require("ioredis"));
const lodash_1 = require("lodash");
const redis = new ioredis_1.default();
const wire = new i2c_1.default(0x5c, { device: '/dev/i2c-1', });
const buf = Buffer.alloc(8, 0x00);
function measure(waitTime = 600) {
    return new Promise((resolve, reject) => {
        const id = (0, lodash_1.uniqueId)();
        const start = performance.now();
        wire.writeByte(0x00, (err) => {
            // if (err) return reject(err);
        });
        // });
        buf[0] = 0x03;
        buf[2] = 0x04;
        wire.write(buf, function (err) {
            // if (err) return reject(err);
        });
        setTimeout(() => {
            wire.readBytes(0x00, 8, function (err, res) {
                console.dir(res);
                // if (err) return reject(err);
                const data = new Uint8Array(8);
                if (res.at(0) === 0)
                    return reject(err);
                res.copy(data);
                const results = new ArrayBuffer(64);
                const abv = new DataView(results, 0, 64);
                abv.setFloat64(0, (data[3] | data[2] << 8) / 10);
                abv.setFloat64(8, (data[5] | data[4] << 8) / 10);
                const humidity = abv.getFloat64(0);
                const temp = abv.getFloat64(8);
                const vals = { temp, humidity };
                const duration = performance.now() - start;
                // const entry = performance.measure(nanoid(6), { start: id, detail: { vals } });
                redis
                    .multi()
                    .rpush('measurements', id)
                    .hset('timing:' + id, {
                    start,
                    duration,
                    host: process.env.HOST,
                    waitTime
                })
                    .hset('values:' + id, (0, lodash_1.toPairs)(vals))
                    .exec();
                console.log(vals);
                return resolve(vals);
            });
        }, waitTime);
    });
}
exports.measure = measure;
// const obs = new PerformanceObserver((list, observer) => {
//   console.log(list.getEntries()[0]);
//   performance.clearMarks();
//   performance.clearMeasures();
//   observer.disconnect();
// });
// obs.observe({ entryTypes: ['measure'], buffered: true });
setInterval(() => { measure(1500).catch(console.error); }, 600);
//# sourceMappingURL=native.js.map