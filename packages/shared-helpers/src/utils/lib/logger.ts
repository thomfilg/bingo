import * as util from 'util';
import * as winston from 'winston';

const isDevelopment = () => process.env['NODE_ENV'] === 'development';

const getDateTime = (date: Date) => date.toISOString().replace('T', ' ').substring(0, 19);

const splatSymbol = Symbol.for('splat');
export type ILogger = winston.Logger;
export const logger: ILogger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'silly',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, feature, [splatSymbol]: splatArgs = [] }) => {
      const isProd = !isDevelopment();
      const timestamp = getDateTime(new Date());
      const formattedMessage = [timestamp, message, ...(Array.isArray(splatArgs) ? splatArgs : [])].map((value) => {
        try {
          if (typeof value === 'object' || Array.isArray(value) || typeof value === 'function') {
            return util.inspect(value, {
              depth: 5,
              showHidden: false,
              showProxy: false,
              maxArrayLength: null,
              compact: isProd,
            });
          }
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value;
          }
          if (typeof value === 'symbol' || typeof value === 'bigint') {
            return value.toString();
          }
          return String(value);
        } catch (error) {
          console.error(`Error formatting value: ${error}`);
          return value;
        }
      }).join(' ');

      const prefix = feature ? `${level} [${feature}]` : level;
      return `${prefix} ${formattedMessage}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

 export const createFeatureLogger = (featureName: string, enabled: boolean = true): ILogger => logger.child({ feature: featureName, silent: !enabled });
