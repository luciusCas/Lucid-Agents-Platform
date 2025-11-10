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
      defaultMeta: { service: 'ecommerce-agent' },
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

export class PriceTracker {
  static trackPrice(productId: string, currentPrice: number, history: any[]): void {
    history.push({
      productId,
      price: currentPrice,
      timestamp: new Date()
    });
  }
}

export class InventoryManager {
  static checkStock(products: any[]): any[] {
    return products.filter(p => p.stock < 10);
  }
}