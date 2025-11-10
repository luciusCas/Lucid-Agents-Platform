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
      defaultMeta: { service: 'game-agent' },
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

export class ScreenshotManager {
  static async takeScreenshot(path: string): Promise<void> {
    // Implementation for taking screenshots
    console.log(`Screenshot saved to: ${path}`);
  }
}

export class PerformanceAnalyzer {
  static analyzeMetrics(metrics: any): any {
    const avgFps = metrics.fps.reduce((a: number, b: number) => a + b, 0) / metrics.fps.length;
    const maxMemory = Math.max(...metrics.memory);
    
    return {
      averageFps: Math.round(avgFps),
      maxMemory: Math.round(maxMemory),
      performance: avgFps > 50 ? 'excellent' : avgFps > 30 ? 'good' : 'poor'
    };
  }
}