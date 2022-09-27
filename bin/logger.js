"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importStar(require("winston"));
const { combine, timestamp, printf, splat, simple, json, colorize } = winston_1.format;
// import expressWinston from 'express-winston';
// const log = logging.log(logName);
// Create a Bunyan logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
const logger = winston_1.default.createLogger({
    format: combine(timestamp({ format: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ' }), winston_1.format.json()),
    handleExceptions: true,
    level: 'verbose',
    transports: [
        // loki,
        new winston_1.transports.Console({
            format: winston_1.format.cli(),
        }),
        new winston_1.transports.File({
            level: 'error',
            filename: 'logs/error.log'
        }),
        new winston_1.transports.File({
            filename: 'logs/info.log'
        }),
        new winston_1.transports.File({
            level: 'verbose',
            filename: 'logs/verbose.log'
        })
    ],
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: 'logs/exceptions.log'
        }),
    ]
});
exports.default = logger;
//# sourceMappingURL=logger.js.map