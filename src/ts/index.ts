import 'dotenv/config';

import IORedis from 'ioredis';

import { promisify } from 'util';
import { join } from 'path';
const execFile = promisify(require('child_process').execFile);

class Reader {
    static async readData() {
        const { stdout } = await execFile(join(__dirname, 'sensor'));
        return JSON.parse(stdout);
    }
}

class Transmitter {
    private redis: IORedis.Redis;
    constructor() {
        this.redis = new IORedis(process.env['REDIS_URI']);
    }

    async submitData(temperature: number, humidity: number) {
        await this.redis.rpush(process.env['ROOM'], JSON.stringify({
            temperature,
            humidity,
            time: Date.now()
        }));
    }
}


(async function main() {
    const transmitter = new Transmitter();

    const data = await Reader.readData();
    await transmitter.submitData(data.temperature, data.humidity);

    process.exit();
})();
