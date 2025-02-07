"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const util_1 = require("util");
const path_1 = require("path");
const lodash_1 = __importDefault(require("lodash"));
const config_1 = __importDefault(require("config"));
const instance_1 = __importDefault(require("./instance"));
const logger_1 = __importDefault(require("./logger"));
const axios_1 = __importDefault(require("axios"));
const hmac_auth_express_1 = require("hmac-auth-express");
const execFile = (0, util_1.promisify)(require('child_process').execFile);
const instance = new instance_1.default();
class Data {
    constructor(input) {
        lodash_1.default.assign(this, lodash_1.default.create(Data.prototype, JSON.parse(input)), { time: new Date() });
    }
}
class Reader {
    static async readData() {
        const { stdout } = await execFile((0, path_1.join)(__dirname, 'sensor'));
        return new Data(stdout);
    }
}
class Transmitter {
    constructor() {
        this.client = axios_1.default.create(config_1.default.get('api'));
    }
    async submitData(data) {
        const payload = {
            instance,
            data: lodash_1.default.assign(data, { device_temp: await instance.getTemp(), load: instance.load })
        };
        const time = Date.now().toString();
        const digest = (0, hmac_auth_express_1.generate)(config_1.default.get('web.hmac.secret'), 'sha256', time, 'POST', '/api/add', payload).digest('hex'); // 76251c6323fbf6355f23816a4c2e12edfd10672517104763ab1b10f078277f86
        const hmac = `HMAC ${time}:${digest}`;
        logger_1.default.verbose('prepared submit', {
            payload,
            hmac
        });
        const res = await this.client('/api/add', {
            headers: {
                'Authorization': hmac
            },
            data: payload
        });
        logger_1.default.info('finished submit', res.data);
    }
}
(async function main() {
    logger_1.default.info('started instance', instance);
    const transmitter = new Transmitter();
    async function sendData() {
        const data = await Reader.readData();
        await transmitter.submitData(data);
        setTimeout(sendData, 10 * 1000);
    }
    sendData();
})();
//# sourceMappingURL=index.js.map