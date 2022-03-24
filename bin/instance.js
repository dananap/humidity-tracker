"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
class Instance {
    id;
    room;
    hostname;
    constructor() {
        this.id = fs_1.default.readFileSync('/etc/machine-id', 'utf8').trim();
        this.room = process.env['ROOM'];
        this.hostname = os_1.default.hostname();
    }
    get uptime() {
        return os_1.default.uptime();
    }
    get load() {
        return os_1.default.loadavg()[0];
    }
    async getTemp() {
        const out = await fs_1.default.promises.readFile('/sys/class/thermal/thermal_zone0/temp', 'ascii');
        return out / 1000;
    }
}
exports.default = Instance;
//# sourceMappingURL=instance.js.map