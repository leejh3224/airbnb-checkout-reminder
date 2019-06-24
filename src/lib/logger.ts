import { createLogger, format, transports } from 'winston';

const { combine, timestamp, prettyPrint } = format;

const enumerateErrorFormat = format((info: any) => {
  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );
  }

  return info;
});

const logger = createLogger({
  format: combine(
    combine(
      enumerateErrorFormat(),
      timestamp({
        format: 'MM-DD HH:mm:ss',
      }),
      prettyPrint(),
    ),
  ),
  transports: [new transports.Console()],
});

export default logger;
