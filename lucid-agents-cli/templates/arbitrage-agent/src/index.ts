import { Agent } from './agent.js';
import { ArbitrageAgentConfig } from './types.js';

const config: ArbitrageAgentConfig = {
  name: 'arbitrage-agent',
  version: '1.0.0',
  description: 'Agent untuk mengidentifikasi dan mengeksekusi peluang arbitrase cryptocurrency',
  exchanges: {
    binance: {
      enabled: true,
      apiKey: process.env.BINANCE_API_KEY || '',
      secret: process.env.BINANCE_SECRET || '',
      sandbox: process.env.NODE_ENV === 'development'
    },
    coinbase: {
      enabled: true,
      apiKey: process.env.COINBASE_API_KEY || '',
      secret: process.env.COINBASE_SECRET || '',
      passphrase: process.env.COINBASE_PASSPHRASE || ''
    },
    kraken: {
      enabled: true,
      apiKey: process.env.KRAKEN_API_KEY || '',
      secret: process.env.KRAKEN_SECRET || ''
    }
  },
  trading: {
    minProfitThreshold: 0.5, // 0.5% minimum profit
    maxTradeAmount: 1000, // USD
    maxSlippage: 0.1, // 0.1% maximum slippage
    riskLevel: 'medium'
  },
  monitoring: {
    updateInterval: 1000, // 1 second
    priceHistoryLimit: 1000,
    alertThreshold: 1.0 // 1% minimum for alerts
  },
  database: {
    path: './data/arbitrage.db'
  },
  logging: {
    level: 'info',
    file: 'logs/arbitrage-agent.log'
  }
};

async function main() {
  try {
    const agent = new Agent(config);
    await agent.initialize();
    await agent.start();
    
    console.log('🚀 Arbitrage Agent started successfully');
  } catch (error) {
    console.error('❌ Failed to start Arbitrage Agent:', error);
    process.exit(1);
  }
}

main();