import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.colorize({ all: true }),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(
              ({ timestamp, level, message, ...metadata }) => {
                const meta =
                  metadata && Object.keys(metadata).length
                    ? JSON.stringify(metadata, null, 2)
                    : '';
                return `${String(timestamp)} [${level}] ${String(message)} ${meta}`;
              },
            ),
          ),
        }),
      ],
    });
  }

  private logMessage(
    level: string,
    message: string,
    metadata: Record<string, unknown> = {},
  ): void {
    this.logger.log(level, message, metadata);
  }

  error(message: string, metadata: Record<string, unknown> = {}): void {
    this.logMessage('error', message, metadata);
  }

  warn(message: string, metadata: Record<string, unknown> = {}): void {
    this.logMessage('warn', message, metadata);
  }

  log(message: string, metadata: Record<string, unknown> = {}): void {
    this.logMessage('info', message, metadata);
  }

  debug(message: string, metadata: Record<string, unknown> = {}): void {
    this.logMessage('debug', message, metadata);
  }
}
