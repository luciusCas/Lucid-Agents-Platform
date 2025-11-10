export interface ArbitrageAgentConfig {
  name: string;
  version: string;
  description: string;
  exchanges: {
    binance: ExchangeConfig;
    coinbase: ExchangeConfig;
    kraken: ExchangeConfig;
  };
  trading: TradingConfig;
  monitoring: MonitoringConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
}

export interface ExchangeConfig {
  enabled: boolean;
  apiKey: string;
  secret: string;
  sandbox?: boolean;
  passphrase?: string;
}

export interface TradingConfig {
  minProfitThreshold: number; // minimum profit percentage
  maxTradeAmount: number; // maximum trade amount in USD
  maxSlippage: number; // maximum allowed slippage
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MonitoringConfig {
  updateInterval: number; // milliseconds
  priceHistoryLimit: number;
  alertThreshold: number; // percentage threshold for alerts
}

export interface DatabaseConfig {
  path: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  file?: string;
}

export interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercentage: number;
  volume: number;
  timestamp: Date;
  executed: boolean;
  confidence?: number;
  riskScore?: number;
}

export interface Trade {
  id: string;
  opportunityId?: string;
  symbol: string;
  exchangeBuy: string;
  exchangeSell: string;
  amount: number;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  status: TradeStatus;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  fees?: {
    buy: number;
    sell: number;
    total: number;
  };
}

export type TradeStatus = 
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  exchange: string;
  bid?: number;
  ask?: number;
  spread?: number;
  change24h?: number;
}

export interface Exchange {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  secret: string;
  publicOnly: boolean;
  supports: {
    rest: boolean;
    websockets: boolean;
    sandbox: boolean;
    fetchTickers: boolean;
    fetchOrderBook: boolean;
    fetchTrades: boolean;
    fetchOHLCV: boolean;
    createMarketOrder: boolean;
    createLimitOrder: boolean;
    createStopOrder: boolean;
    createStopLimitOrder: boolean;
  };
  limits: {
    amount: { min?: number; max?: number };
    price: { min?: number; max?: number };
    cost: { min?: number; max?: number };
  };
  fees: {
    trading: { maker?: number; taker?: number };
    funding: { withdraw?: Record<string, number>; deposit?: Record<string, number> };
  };
}

export interface OrderBook {
  symbol: string;
  exchange: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: Date;
  nonce: number;
}

export interface Ticker {
  symbol: string;
  exchange: string;
  high: number;
  low: number;
  bid: number;
  bidVolume: number;
  ask: number;
  askVolume: number;
  last: number;
  baseVolume: number;
  quoteVolume: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

export interface Kline {
  symbol: string;
  exchange: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closed: boolean;
}

export interface Balance {
  [currency: string]: {
    free: number;
    used: number;
    total: number;
  };
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  percentage: number;
}

export interface RiskMetrics {
  totalExposure: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  totalFees: number;
  netProfit: number;
  returnOnInvestment: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  averageTradeTime: number;
  bestTrade: number;
  worstTrade: number;
  tradingDays: number;
}

export interface AlertConfig {
  enabled: boolean;
  minProfit: number;
  minVolume: number;
  exchanges: string[];
  symbols: string[];
  notificationMethods: NotificationMethod[];
}

export type NotificationMethod = 
  | 'email'
  | 'webhook'
  | 'slack'
  | 'telegram'
  | 'discord';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  data: any;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export type AlertType = 
  | 'opportunity'
  | 'trade_executed'
  | 'trade_failed'
  | 'high_spread'
  | 'exchange_down'
  | 'risk_exceeded'
  | 'profit_target_reached'
  | 'stop_loss_triggered';

export interface WebhookPayload {
  event: AlertType;
  agent: string;
  timestamp: string;
  data: {
    opportunity?: ArbitrageOpportunity;
    trade?: Trade;
    metrics?: PerformanceMetrics;
    [key: string]: any;
  };
}

export interface EnvironmentVariables {
  NODE_ENV?: 'development' | 'production' | 'test';
  LOG_LEVEL?: string;
  BINANCE_API_KEY?: string;
  BINANCE_SECRET?: string;
  COINBASE_API_KEY?: string;
  COINBASE_SECRET?: string;
  COINBASE_PASSPHRASE?: string;
  KRAKEN_API_KEY?: string;
  KRAKEN_SECRET?: string;
  WEBHOOK_URL?: string;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
  SLACK_WEBHOOK_URL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}