import 'dotenv/config';
import os from 'os';
import fs from 'fs';

export default class Instance {
    id: string;
    room: string;
    hostname: string;

    constructor() {
        this.id = fs.readFileSync('/etc/machine-id', 'utf8').trim();
        this.room = process.env['ROOM'];
        this.hostname = os.hostname();
    }

    get uptime() {
        return os.uptime();
    }

    get load() {
        return os.loadavg()[0];
    }

    async getTemp() {
        const out =await fs.promises.readFile('/sys/class/thermal/thermal_zone0/temp', 'ascii');
        return (<number><unknown>out)/1000;
    }
    
}