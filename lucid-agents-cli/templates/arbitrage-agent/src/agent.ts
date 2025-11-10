import { EventEmitter } from 'events';
import axios from 'axios';
import WebSocket from 'ws';
import { ArbitrageAgentConfig, ArbitrageOpportunity, Trade, Exchange, MarketData } from './types.js';
import { Logger, Database } from './utils.js';
import * as ccxt from 'ccxt';

export class Agent extends EventEmitter {
  private config: ArbitrageAgentConfig;
  private logger: Logger;
  private database: Database;
  private isRunning = false;
  private exchanges: Map<string, any> = new Map();
  private priceStreams: Map<string, WebSocket> = new Map();
  private opportunities: ArbitrageOpportunity[] = [];
  private activeTrades: Map<string, Trade> = new Map();
  private marketData: Map<string, MarketData> = new Map();

  constructor(config: ArbitrageAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger(config.logging);
    this.database = new Database(config.database.path);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Arbitrage Agent...');
    
    // Initialize database
    await this.initializeDatabase();
    
    // Initialize exchanges
    await this.initializeExchanges();
    
    // Setup event handlers
    this.setupEventHandlers();

    this.logger.info('Arbitrage Agent initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting Arbitrage Agent...');

    // Start price monitoring
    this.startPriceMonitoring();
    
    // Start opportunity detection
    this.startOpportunityDetection();
    
    // Start trade execution
    this.startTradeExecution();

    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.logger.info('Stopping Arbitrage Agent...');

    // Close price streams
    this.priceStreams.forEach(stream => stream.close());
    this.priceStreams.clear();

    // Cancel active trades
    this.activeTrades.forEach(trade => {
      trade.status = 'cancelled';
    });

    this.emit('stopped');
    this.logger.info('Arbitrage Agent stopped');
  }

  private async initializeDatabase(): Promise<void> {
    this.logger.info('Initializing database...');
    
    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        buy_exchange TEXT NOT NULL,
        sell_exchange TEXT NOT NULL,
        buy_price REAL NOT NULL,
        sell_price REAL NOT NULL,
        profit REAL NOT NULL,
        profit_percentage REAL NOT NULL,
        volume REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        executed BOOLEAN DEFAULT FALSE
      )
    `);

    await this.database.execute(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        opportunity_id TEXT,
        symbol TEXT NOT NULL,
        exchange_buy TEXT NOT NULL,
        exchange_sell TEXT NOT NULL,
        amount REAL NOT NULL,
        buy_price REAL NOT NULL,
        sell_price REAL NOT NULL,
        profit REAL NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    this.logger.info('Database initialized');
  }

  private async initializeExchanges(): Promise<void> {
    this.logger.info('Initializing exchanges...');

    // Initialize Binance
    if (this.config.exchanges.binance.enabled) {
      try {
        const binance = new ccxt.binance({
          apiKey: this.config.exchanges.binance.apiKey,
          secret: this.config.exchanges.binance.secret,
          sandbox: this.config.exchanges.binance.sandbox,
          enableRateLimit: true
        });

        this.exchanges.set('binance', binance);
        this.logger.info('Binance exchange initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Binance:', error);
      }
    }

    // Initialize Coinbase Pro
    if (this.config.exchanges.coinbase.enabled) {
      try {
        const coinbase = new ccxt.coinbasepro({
          apiKey: this.config.exchanges.coinbase.apiKey,
          secret: this.config.exchanges.coinbase.secret,
          passphrase: this.config.exchanges.coinbase.pasphrase,
          enableRateLimit: true
        });

        this.exchanges.set('coinbase', coinbase);
        this.logger.info('Coinbase exchange initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Coinbase:', error);
      }
    }

    // Initialize Kraken
    if (this.config.exchanges.kraken.enabled) {
      try {
        const kraken = new ccxt.kraken({
          apiKey: this.config.exchanges.kraken.apiKey,
          secret: this.config.exchanges.kraken.secret,
          enableRateLimit: true
        });

        this.exchanges.set('kraken', kraken);
        this.logger.info('Kraken exchange initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Kraken:', error);
      }
    }

    this.logger.info(`Initialized ${this.exchanges.size} exchanges`);
  }

  private startPriceMonitoring(): void {
    this.logger.info('Starting price monitoring...');

    const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT'];

    symbols.forEach(symbol => {
      this.startPriceStream(symbol);
    });
  }

  private startPriceStream(symbol: string): void {
    const streamUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase().replace('/', '').toLowerCase()}@ticker`;
    
    const ws = new WebSocket(streamUrl);
    
    ws.on('open', () => {
      this.logger.debug(`Price stream opened for ${symbol}`);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handlePriceUpdate(symbol, message);
      } catch (error) {
        this.logger.error('Error parsing price data:', error);
      }
    });

    ws.on('error', (error) => {
      this.logger.error(`Price stream error for ${symbol}:`, error);
    });

    ws.on('close', () => {
      this.logger.debug(`Price stream closed for ${symbol}`);
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (this.isRunning) {
          this.startPriceStream(symbol);
        }
      }, 5000);
    });

    this.priceStreams.set(symbol, ws);
  }

  private handlePriceUpdate(symbol: string, data: any): void {
    const price = parseFloat(data.c); // current price
    const volume = parseFloat(data.v); // volume
    
    const marketData: MarketData = {
      symbol,
      price,
      volume,
      timestamp: new Date(),
      exchange: 'binance'
    };

    this.marketData.set(`${symbol}_binance`, marketData);
    
    // Trigger opportunity detection
    this.detectArbitrageOpportunity(symbol);
  }

  private startOpportunityDetection(): void {
    this.logger.info('Starting opportunity detection...');
    
    setInterval(() => {
      if (this.isRunning) {
        this.scanForOpportunities();
      }
    }, this.config.monitoring.updateInterval);
  }

  private scanForOpportunities(): void {
    const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT'];
    
    symbols.forEach(symbol => {
      this.detectArbitrageOpportunity(symbol);
    });
  }

  private detectArbitrageOpportunity(symbol: string): void {
    const prices: { exchange: string; price: number }[] = [];
    
    // Collect current prices from all exchanges
    this.marketData.forEach((data, key) => {
      if (data.symbol === symbol) {
        prices.push({
          exchange: data.exchange,
          price: data.price
        });
      }
    });

    if (prices.length < 2) {
      return; // Need at least 2 exchanges to find arbitrage
    }

    // Find best buy and sell prices
    const sortedPrices = prices.sort((a, b) => a.price - b.price);
    const buyExchange = sortedPrices[0];
    const sellExchange = sortedPrices[sortedPrices.length - 1];
    
    const profit = sellExchange.price - buyExchange.price;
    const profitPercentage = (profit / buyExchange.price) * 100;
    
    if (profitPercentage >= this.config.trading.minProfitThreshold) {
      const opportunity: ArbitrageOpportunity = {
        id: this.generateId(),
        symbol,
        buyExchange: buyExchange.exchange,
        sellExchange: sellExchange.exchange,
        buyPrice: buyExchange.price,
        sellPrice: sellExchange.price,
        profit,
        profitPercentage,
        volume: Math.min(this.config.trading.maxTradeAmount / buyExchange.price, 1000),
        timestamp: new Date(),
        executed: false
      };

      this.opportunities.push(opportunity);
      this.logger.info(`Arbitrage opportunity found: ${symbol} - ${profitPercentage.toFixed(2)}% profit`);
      
      this.emit('opportunityFound', opportunity);
    }
  }

  private startTradeExecution(): void {
    this.logger.info('Starting trade execution...');
    
    this.on('opportunityFound', async (opportunity: ArbitrageOpportunity) => {
      if (this.shouldExecuteTrade(opportunity)) {
        await this.executeArbitrageTrade(opportunity);
      }
    });
  }

  private shouldExecuteTrade(opportunity: ArbitrageOpportunity): boolean {
    // Implement trading logic based on risk assessment
    const riskScore = this.calculateRiskScore(opportunity);
    
    // Execute if risk score is acceptable
    return riskScore <= 0.7; // 70% risk threshold
  }

  private calculateRiskScore(opportunity: ArbitrageOpportunity): number {
    let riskScore = 0;
    
    // Price volatility risk
    if (opportunity.profitPercentage < 1) riskScore += 0.2;
    else if (opportunity.profitPercentage < 0.5) riskScore += 0.1;
    
    // Exchange risk
    if (opportunity.buyExchange === opportunity.sellExchange) {
      riskScore += 0.5; // Same exchange arbitrage is risky
    }
    
    // Time risk (older opportunities are riskier)
    const age = Date.now() - opportunity.timestamp.getTime();
    if (age > 10000) riskScore += 0.3; // 10 seconds old
    
    return Math.min(riskScore, 1);
  }

  private async executeArbitrageTrade(opportunity: ArbitrageOpportunity): Promise<void> {
    this.logger.info(`Executing arbitrage trade for ${opportunity.symbol}`);
    
    const trade: Trade = {
      id: this.generateId(),
      opportunityId: opportunity.id,
      symbol: opportunity.symbol,
      exchangeBuy: opportunity.buyExchange,
      exchangeSell: opportunity.sellExchange,
      amount: opportunity.volume,
      buyPrice: opportunity.buyPrice,
      sellPrice: opportunity.sellPrice,
      profit: opportunity.profit,
      status: 'executing',
      createdAt: new Date()
    };

    this.activeTrades.set(trade.id, trade);

    try {
      // Execute buy order
      const buyResult = await this.executeBuyOrder(trade);
      
      if (!buyResult.success) {
        throw new Error(`Buy order failed: ${buyResult.error}`);
      }

      // Execute sell order
      const sellResult = await this.executeSellOrder(trade);
      
      if (!sellResult.success) {
        throw new Error(`Sell order failed: ${sellResult.error}`);
      }

      // Mark as completed
      trade.status = 'completed';
      trade.completedAt = new Date();
      
      this.logger.info(`Arbitrage trade completed: ${trade.profit.toFixed(2)} profit`);
      this.emit('tradeCompleted', trade);
      
    } catch (error) {
      trade.status = 'failed';
      trade.error = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Arbitrage trade failed:', error);
      this.emit('tradeFailed', trade);
    } finally {
      this.activeTrades.delete(trade.id);
    }
  }

  private async executeBuyOrder(trade: Trade): Promise<{ success: boolean; error?: string }> {
    try {
      const exchange = this.exchanges.get(trade.exchangeBuy);
      if (!exchange) {
        return { success: false, error: `Exchange ${trade.exchangeBuy} not available` };
      }

      // Simulate buy order (in real implementation, use actual exchange API)
      const order = await exchange.createMarketBuyOrder(trade.symbol, trade.amount);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async executeSellOrder(trade: Trade): Promise<{ success: boolean; error?: string }> {
    try {
      const exchange = this.exchanges.get(trade.exchangeSell);
      if (!exchange) {
        return { success: false, error: `Exchange ${trade.exchangeSell} not available` };
      }

      // Simulate sell order (in real implementation, use actual exchange API)
      const order = await exchange.createMarketSellOrder(trade.symbol, trade.amount);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private setupEventHandlers(): void {
    this.on('opportunityFound', (opportunity: ArbitrageOpportunity) => {
      this.logger.info(`Opportunity found: ${opportunity.symbol} - ${opportunity.profitPercentage.toFixed(2)}%`);
    });

    this.on('tradeCompleted', (trade: Trade) => {
      this.logger.info(`Trade completed: ${trade.profit.toFixed(2)} profit`);
    });

    this.on('tradeFailed', (trade: Trade) => {
      this.logger.error(`Trade failed: ${trade.error}`);
    });
  }

  private generateId(): string {
    return `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external access
  getOpportunities(): ArbitrageOpportunity[] {
    return [...this.opportunities];
  }

  getActiveTrades(): Trade[] {
    return Array.from(this.activeTrades.values());
  }

  getMarketData(symbol?: string): Map<string, MarketData> {
    if (symbol) {
      const filtered = new Map<string, MarketData>();
      this.marketData.forEach((data, key) => {
        if (data.symbol === symbol) {
          filtered.set(key, data);
        }
      });
      return filtered;
    }
    return new Map(this.marketData);
  }
}