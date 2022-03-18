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
            {time: new Date()}
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
            url: 'http://10.8.0.4:8769/api/add',
            method: 'POST',
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json'
            },

        });
    }

    async submitData(data: Data) {
        await this.db.collection('sensors').insertOne({
            instance: _.pick(instance, 'id', 'room'),
            ...data,
            device_temp: await instance.getTemp()
        });
        await this.db.collection('instances').updateOne({ id: instance.id}, {$set: _.pick(instance, ['room', 'uptime', 'hostname'])}, {upsert: true});
        await this.redis.sadd('instances', instance.id);
        await this.redis.hmset('instace:' + instance.id, {..._.pick(instance, ['room', 'uptime', 'hostname']), temp: await instance.getTemp()});
    }
}


(async function main() {
    logger.info('started instance', instance);

    const transmitter = new Transmitter();

    await transmitter.client.connect();
    logger.info('mongo connected');
    // const instances = transmitter.db.collection('instances');
    // instances.insertOne({...instance, updatedAt: new Date()});

    async function sendData() {
        const data = await Reader.readData();
        await transmitter.submitData(data);
        logger.info('submitted', {data, instance})
    }

    setInterval(sendData, 60*1000);
    sendData();

})();
