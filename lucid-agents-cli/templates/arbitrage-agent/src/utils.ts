import * as fs from 'fs';
import * as path from 'path';
import sqlite3 from 'sqlite3';
import winston from 'winston';
import { open, Database as SQLiteDatabase } from 'sqlite';
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
      defaultMeta: { service: 'arbitrage-agent' },
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

export class Database {
  private db: SQLiteDatabase | null = null;
  private path: string;

  constructor(path: string) {
    this.path = path;
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    const dir = path.dirname(this.path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async connect(): Promise<void> {
    this.db = await open({
      filename: this.path,
      driver: sqlite3.Database
    });
  }

  async execute(query: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      await this.connect();
    }

    try {
      const result = await this.db!.run(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async query(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      await this.connect();
    }

    try {
      const result = await this.db!.all(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async get(query: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      await this.connect();
    }

    try {
      const result = await this.db!.get(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export class PriceAnalyzer {
  static calculateMovingAverage(prices: number[], period: number): number {
    if (prices.length < period) {
      throw new Error('Not enough data for moving average');
    }

    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error('Not enough data for RSI calculation');
    }

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    if (gains.length < period) {
      throw new Error('Not enough data for RSI calculation');
    }

    const avgGain = this.calculateMovingAverage(gains, period);
    const avgLoss = this.calculateMovingAverage(losses, period);

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) {
      throw new Error('Not enough data for volatility calculation');
    }

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const return_ = (prices[i] - prices[i - 1]) / prices[i - 1];
      returns.push(return_);
    }

    const meanReturn = returns.reduce((acc, ret) => acc + ret, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  static detectTrend(prices: number[]): 'bullish' | 'bearish' | 'sideways' {
    if (prices.length < 10) {
      return 'sideways';
    }

    const shortMA = this.calculateMovingAverage(prices.slice(-5), 5);
    const longMA = this.calculateMovingAverage(prices.slice(-10), 10);
    const mediumMA = this.calculateMovingAverage(prices.slice(-7), 7);

    if (shortMA > mediumMA && mediumMA > longMA) {
      return 'bullish';
    } else if (shortMA < mediumMA && mediumMA < longMA) {
      return 'bearish';
    } else {
      return 'sideways';
    }
  }
}

export class RiskCalculator {
  static calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    stopLossPercentage: number
  ): number {
    const riskAmount = accountBalance * (riskPercentage / 100);
    return riskAmount / (stopLossPercentage / 100);
  }

  static calculateStopLoss(
    entryPrice: number,
    side: 'long' | 'short',
    percentage: number
  ): number {
    if (side === 'long') {
      return entryPrice * (1 - percentage / 100);
    } else {
      return entryPrice * (1 + percentage / 100);
    }
  }

  static calculateTakeProfit(
    entryPrice: number,
    side: 'long' | 'short',
    percentage: number
  ): number {
    if (side === 'long') {
      return entryPrice * (1 + percentage / 100);
    } else {
      return entryPrice * (1 - percentage / 100);
    }
  }

  static calculateLeverage(
    accountBalance: number,
    tradeAmount: number
  ): number {
    return tradeAmount / accountBalance;
  }

  static calculateMarginRequirement(
    tradeAmount: number,
    leverage: number
  ): number {
    return tradeAmount / leverage;
  }
}

export class ArbitrageDetector {
  static calculateArbitrage(
    price1: number,
    price2: number,
    fee1: number = 0,
    fee2: number = 0
  ): {
    profit: number;
    profitPercentage: number;
    spread: number;
  } {
    const maxPrice = Math.max(price1, price2);
    const minPrice = Math.min(price1, price2);
    
    const grossProfit = maxPrice - minPrice;
    const totalFees = (maxPrice * fee1) + (minPrice * fee2);
    const netProfit = grossProfit - totalFees;
    
    const profitPercentage = (netProfit / minPrice) * 100;
    const spread = ((maxPrice - minPrice) / minPrice) * 100;

    return {
      profit: netProfit,
      profitPercentage,
      spread
    };
  }

  static findBestArbitrage(
    prices: Map<string, { exchange: string; price: number }>
  ): ArbitrageOpportunity | null {
    const priceList = Array.from(prices.values());
    
    if (priceList.length < 2) {
      return null;
    }

    // Find minimum and maximum prices
    let minPrice = priceList[0];
    let maxPrice = priceList[0];

    for (const price of priceList) {
      if (price.price < minPrice.price) {
        minPrice = price;
      }
      if (price.price > maxPrice.price) {
        maxPrice = price;
      }
    }

    const arbitrage = this.calculateArbitrage(minPrice.price, maxPrice.price);

    if (arbitrage.profitPercentage > 0.1) { // Minimum 0.1% profit
      return {
        id: `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: 'UNKNOWN', // Should be passed as parameter
        buyExchange: minPrice.exchange,
        sellExchange: maxPrice.exchange,
        buyPrice: minPrice.price,
        sellPrice: maxPrice.price,
        profit: arbitrage.profit,
        profitPercentage: arbitrage.profitPercentage,
        volume: 0, // Should be calculated based on available liquidity
        timestamp: new Date(),
        executed: false,
        confidence: this.calculateConfidence(priceList),
        riskScore: this.calculateRisk(arbitrage)
      };
    }

    return null;
  }

  private static calculateConfidence(prices: { exchange: string; price: number }[]): number {
    // Simple confidence calculation based on price spread
    const maxPrice = Math.max(...prices.map(p => p.price));
    const minPrice = Math.min(...prices.map(p => p.price));
    const spread = ((maxPrice - minPrice) / minPrice) * 100;
    
    // Higher spread = higher confidence
    return Math.min(spread / 10, 1); // Cap at 1.0
  }

  private static calculateRisk(arbitrage: { profitPercentage: number; spread: number }): number {
    let risk = 0;

    // Lower profit = higher risk
    if (arbitrage.profitPercentage < 0.5) risk += 0.3;
    else if (arbitrage.profitPercentage < 1) risk += 0.2;
    else if (arbitrage.profitPercentage < 2) risk += 0.1;

    // Higher spread = higher risk (indicates potential execution issues)
    if (arbitrage.spread > 5) risk += 0.4;
    else if (arbitrage.spread > 2) risk += 0.2;
    else if (arbitrage.spread > 1) risk += 0.1;

    return Math.min(risk, 1);
  }
}

export class NotificationManager {
  static async sendEmail(
    to: string,
    subject: string,
    message: string,
    config: any
  ): Promise<void> {
    // Email implementation would go here
    console.log(`Email sent to ${to}: ${subject}`);
  }

  static async sendWebhook(
    url: string,
    payload: any,
    headers: Record<string, string> = {}
  ): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  static async sendSlack(
    webhookUrl: string,
    message: string,
    channel?: string
  ): Promise<void> {
    const payload = {
      text: message,
      channel: channel || '#arbitrage',
      username: 'Arbitrage Agent',
      icon_emoji: ':robot_face:'
    };

    await this.sendWebhook(webhookUrl, payload);
  }

  static async sendTelegram(
    botToken: string,
    chatId: string,
    message: string
  ): Promise<void> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    };

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }
}

export class PerformanceTracker {
  private trades: any[] = [];
  private balance: number = 10000; // Starting balance

  addTrade(trade: any): void {
    this.trades.push(trade);
    this.balance += trade.profit;
  }

  calculateMetrics(): any {
    const completedTrades = this.trades.filter(t => t.status === 'completed');
    const profitableTrades = completedTrades.filter(t => t.profit > 0);
    
    const totalProfit = completedTrades.reduce((sum, t) => sum + t.profit, 0);
    const winRate = (profitableTrades.length / completedTrades.length) * 100;
    const totalReturn = (this.balance - 10000) / 10000 * 100;

    return {
      totalTrades: completedTrades.length,
      profitableTrades: profitableTrades.length,
      winRate,
      totalProfit,
      totalReturn,
      currentBalance: this.balance
    };
  }
}