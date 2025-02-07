import winston, { format, transports } from 'winston';
const {
  combine,
  timestamp,
  printf,
  splat,
  simple,
  json,
  colorize
} = format;

// import expressWinston from 'express-winston';
// const log = logging.log(logName);

// Create a Bunyan logger that streams to Cloud Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
const logger = winston.createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD[T]HH:mm:ss.SSSZ' }),
    format.json()
  ),
  handleExceptions: true,
  level: 'verbose',
  transports: [
    // loki,
    new transports.Console({
      format: format.cli(),
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/error.log'
    }),
    new transports.File({
      filename: 'logs/info.log'
    }),
    new transports.File({
      level: 'verbose',
      filename: 'logs/verbose.log'
    })
  ],
  exceptionHandlers: [
    new transports.File({
      filename: 'logs/exceptions.log'
    }),
  ]
});

export default logger;
