import 'dotenv/config';

import { promisify } from 'util';
import { join } from 'path';
import _ from 'lodash';
import config from 'config';
import Instance from './instance';
import logger from './logger';
import axios, { AxiosInstance } from 'axios';
import { generate } from 'hmac-auth-express';
const execFile = promisify(require('child_process').execFile);

const instance = new Instance();

class Data {
    temperature: number;
    humidity: number;
    time: number | Date;

    constructor(input: string) {
        _.assign(
            this,
            _.create(Data.prototype, JSON.parse(input)),
            { time: new Date() }
        );
    }
}

class Reader {
    static async readData(): Promise<Data> {
        const { stdout } = await execFile(join(__dirname, 'sensor'));
        return new Data(stdout);
    }
}

class Transmitter {
    client: AxiosInstance;
    constructor() {
        this.client = axios.create(config.get('api'));
    }

    async submitData(data: Data) {
        const payload = {
            instance,
            data: _.assign(data, { device_temp: await instance.getTemp(), load: instance.load })
        };

        const time = Date.now().toString();
        const digest = generate(config.get('web.hmac.secret'), 'sha256', time, 'POST', '/api/add', payload).digest('hex'); // 76251c6323fbf6355f23816a4c2e12edfd10672517104763ab1b10f078277f86

        const hmac = `HMAC ${time}:${digest}`;

        logger.verbose('prepared submit', {
            payload,
            hmac
        });

        const res = await this.client('/api/add', {
            headers: {
                'Authorization': hmac
            },
            data: payload
        });

        logger.info('finished submit', res.data);

    }
}


(async function main() {
    logger.info('started instance', instance);

    const transmitter = new Transmitter();

    async function sendData() {
        const data = await Reader.readData();
        await transmitter.submitData(data);
        // logger.info('submitted', { data, instance })
    }

    setInterval(sendData, 20 * 1000);
    sendData();

})();
