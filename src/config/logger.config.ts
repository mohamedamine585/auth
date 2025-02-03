import { transports, createLogger, format } from 'winston';

export const logger = createLogger({
  level: 'info',  // Adjust the log level as needed (e.g., 'debug', 'info', 'warn', 'error')
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      ),
    }),
  ],
});
