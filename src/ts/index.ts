import 'dotenv/config';

import { promisify } from 'util';
import { join } from 'path';
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import _ from 'lodash';
import config from 'config';
import Redis from 'ioredis';
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
        this.client = axios.create({
            baseURL: 'http://10.8.0.6:8769',
            method: 'POST',
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json'
            },

        });
    }

    async submitData(data: Data) {
        const payload = {
            instance,
            data: _.assign(data, { device_temp: await instance.getTemp() })
        };

        const time = Date.now().toString();
        const digest = generate(config.get('web.hmac.secret'), 'sha256', time, 'POST', '/api/add', payload).digest('hex'); // 76251c6323fbf6355f23816a4c2e12edfd10672517104763ab1b10f078277f86

        const hmac = `HMAC ${time}:${digest}`;

        await this.client('/api/add', {
            headers: {
                'Authorization': hmac
            },
            data: payload
        });

    }
}


(async function main() {
    logger.info('started instance', instance);

    const transmitter = new Transmitter();

    // const instances = transmitter.db.collection('instances');
    // instances.insertOne({...instance, updatedAt: new Date()});

    async function sendData() {
        const data = await Reader.readData();
        await transmitter.submitData(data);
        logger.info('submitted', { data, instance })
    }

    setInterval(sendData, 60 * 1000);
    sendData();

})();
