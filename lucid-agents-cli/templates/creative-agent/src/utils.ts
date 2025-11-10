import winston from 'winston';
import { LoggingConfig } from './types.js';

export class Logger {
  private logger: winston.Logger;

  constructor(config: LoggingConfig) {
    this.logger = winston.createLogger({
      level: config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'creative-agent' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    if (config.file) {
      this.logger.add(
        new winston.transports.File({
          filename: config.file
        })
      );
    }
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: any): void {
    if (error instanceof Error) {
      this.logger.error(message, { error: error.message, stack: error.stack });
    } else {
      this.logger.error(message, { error });
    }
  }
}

export class ContentValidator {
  static validateText(text: string): boolean {
    return text.length > 0 && text.length <= 10000;
  }

  static validateImage(prompt: string): boolean {
    return prompt.length > 0 && prompt.length <= 500;
  }

  static validateOutputPath(path: string): boolean {
    return path.length > 0;
  }
}

export class FileManager {
  static async saveContent(content: any, path: string): Promise<void> {
    console.log(`Saving content to: ${path}`);
  }
}