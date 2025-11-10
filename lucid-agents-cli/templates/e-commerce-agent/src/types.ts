// E-commerce Agent Types
import { BaseAgentConfig } from './base-types.js';

export interface ECommerceAgentConfig extends BaseAgentConfig {
  platforms: {
    shopify: PlatformConfig;
    woocommerce: PlatformConfig;
    amazon: PlatformConfig;
    ebay: PlatformConfig;
  };
  automation: {
    inventorySync: boolean;
    priceMonitoring: boolean;
    orderProcessing: boolean;
    customerSupport: boolean;
  };
  monitoring: {
    checkInterval: number;
    priceAlerts: boolean;
    stockAlerts: boolean;
  };
}

export interface PlatformConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  platform: string;
  lastUpdated: Date;
}

export interface PriceAlert {
  id: string;
  productId: string;
  currentPrice: number;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  platform: string;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}