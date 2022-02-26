"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// import { auth, xadd } from '@upstash/redis'
const ioredis_1 = __importDefault(require("ioredis"));
const util_1 = require("util");
const path_1 = require("path");
const execFile = (0, util_1.promisify)(require('child_process').execFile);
// auth(process.env['UPSTASH_REDIS_REST_URL'], process.env['UPSTASH_REDIS_REST_TOKEN']);
class Reader {
    static async readData() {
        const { stdout } = await execFile((0, path_1.join)(__dirname, 'sensor'));
        return JSON.parse(stdout);
    }
}
class Transmitter {
    constructor() {
        this.redis = new ioredis_1.default(process.env['REDIS_URI']);
    }
    async submitData(temperature, humidity) {
        this.redis.connect();
        await this.redis.xadd(process.env['ROOM'], '*', 'temparature', temperature, 'humidity', humidity);
    }
}
async function main() {
    const transmitter = new Transmitter();
    const data = await Reader.readData();
    await transmitter.submitData(data.temperature, data.humidity);
}
main();
//# sourceMappingURL=index.js.map