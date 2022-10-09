import { createLogger, format, LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, errors, json } = format;

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    general: 2,
  },
};

const rotateFileOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '40m',
  maxFiles: '60d',
  json: true,
};

const loggerOptions: LoggerOptions = {
  levels: customLevels.levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new DailyRotateFile({
      ...rotateFileOptions,
      dirname: 'src/logs/error',
      level: 'error',
    }),
    new DailyRotateFile({
      ...rotateFileOptions,
      dirname: 'src/logs/warn',
      level: 'warn',
    }),
    new DailyRotateFile({
      ...rotateFileOptions,
      dirname: 'src/logs/general',
      level: 'general',
    }),
  ],
};

const userLogger = createLogger({
  ...loggerOptions,
  defaultMeta: { service: 'user' },
});

const orderLogger = createLogger({
  ...loggerOptions,
  defaultMeta: { service: 'order' },
});

const apiLogger = createLogger({
  ...loggerOptions,
  defaultMeta: { service: 'api' },
});

export { userLogger, orderLogger, apiLogger };
