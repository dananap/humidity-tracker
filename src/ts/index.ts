import 'dotenv/config';

import { promisify } from 'util';
import { join } from 'path';
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import _ from 'lodash';
const execFile = promisify(require('child_process').execFile);

class Data {
    temperature: number;
    humidity: number;
    time: number | Date;

    constructor(input: string) {
        _.assign(
            this,
            _.create(Data.prototype, JSON.parse(input)),
            {time: new Date(this.time)}
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
    private db: Db;
    private client: MongoClient;
    private uri: string;
    constructor() {
        this.uri = process.env['MONGO_URI'];
        this.client = new MongoClient(this.uri, { serverApi: ServerApiVersion.v1 });
        this.db = this.client.db('home');
    }

    async submitData(data: Data) {
        await this.client.connect();
        await this.db.collection('temperature').insertOne({
            room: process.env['ROOM'],
            ... _.pick(data, ['time', 'humidity'])
        });
        await this.db.collection('temperature').insertOne({
            room: process.env['ROOM'],
            ... _.pick(data, ['temperature', 'time'])
        });
        await this.client.close();
    }
}


(async function main() {
    const transmitter = new Transmitter();

    const data = await Reader.readData();
    await transmitter.submitData(data);

    process.exit();
})();
