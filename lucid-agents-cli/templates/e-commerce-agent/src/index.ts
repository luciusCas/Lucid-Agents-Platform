import { Agent } from './agent.js';
import { ECommerceAgentConfig } from './types.js';

const config: ECommerceAgentConfig = {
  name: 'ecommerce-agent',
  version: '1.0.0',
  description: 'Agent untuk automasi e-commerce dan inventory management',
  platforms: {
    shopify: {
      enabled: true,
      apiKey: process.env.SHOPIFY_API_KEY || '',
      apiSecret: process.env.SHOPIFY_API_SECRET || '',
      url: process.env.SHOPIFY_SHOP_DOMAIN || ''
    },
    woocommerce: {
      enabled: false,
      apiKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      apiSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      url: process.env.WOOCOMMERCE_URL || ''
    },
    amazon: {
      enabled: false,
      apiKey: process.env.AMAZON_ACCESS_KEY_ID || '',
      apiSecret: process.env.AMAZON_SECRET_ACCESS_KEY || ''
    },
    ebay: {
      enabled: false,
      apiKey: process.env.EBAY_API_KEY || '',
      apiSecret: process.env.EBAY_CERT_ID || ''
    }
  },
  automation: {
    inventorySync: true,
    priceMonitoring: true,
    orderProcessing: false,
    customerSupport: false
  },
  monitoring: {
    checkInterval: 300000,
    priceAlerts: true,
    stockAlerts: true
  },
  logging: {
    level: 'info',
    file: 'logs/ecommerce-agent.log'
  }
};

async function main() {
  try {
    const agent = new Agent(config);
    await agent.initialize();
    await agent.start();
    
    console.log('🛒 E-commerce Agent started successfully');
  } catch (error) {
    console.error('❌ Failed to start E-commerce Agent:', error);
    process.exit(1);
  }
}

main();