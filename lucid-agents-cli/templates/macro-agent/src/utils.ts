import * as fs from 'fs';
import * as path from 'path';
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
      defaultMeta: { service: 'macro-agent' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Add file transport if specified
    if (config.file) {
      const logDir = path.dirname(config.file);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      this.logger.add(
        new winston.transports.File({
          filename: config.file,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
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

export class TaskQueue {
  private queue: any[] = [];
  private processing = false;

  add(task: any): void {
    this.queue.push(task);
    if (!this.processing) {
      this.process();
    }
  }

  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error('Task execution failed:', error);
      }
    }

    this.processing = false;
  }

  private async executeTask(task: any): Promise<void> {
    // Implementation depends on task type
    console.log('Executing task:', task.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  get size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}

export class RetryManager {
  private maxRetries: number;
  private retryDelay: number;

  constructor(maxRetries: number = 3, retryDelay: number = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async executeWithRetry<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await this.delay(this.retryDelay * attempt);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ConfigValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateCronExpression(expression: string): boolean {
    // Simple cron validation - can be enhanced
    const parts = expression.split(' ');
    return parts.length === 5 || parts.length === 6;
  }

  static validateFilePath(filePath: string): boolean {
    try {
      return fs.existsSync(filePath) || 
             fs.existsSync(path.dirname(filePath));
    } catch {
      return false;
    }
  }
}

export class FileManager {
  static async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  static async writeFile(filePath: string, data: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, data, 'utf-8');
  }

  static async appendFile(filePath: string, data: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.appendFile(filePath, data, 'utf-8');
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

export class TimeUtils {
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static formatTimestamp(timestamp: Date): string {
    return timestamp.toISOString();
  }

  static now(): Date {
    return new Date();
  }

  static isExpired(timestamp: Date, maxAge: number): boolean {
    return (Date.now() - timestamp.getTime()) > maxAge;
  }
}