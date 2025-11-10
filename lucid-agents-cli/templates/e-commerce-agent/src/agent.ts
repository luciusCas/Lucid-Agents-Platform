import { EventEmitter } from 'events';
import axios from 'axios';
import { ECommerceAgentConfig, Product, Order } from './types.js';
import { Logger } from './utils.js';

export class Agent extends EventEmitter {
  private config: ECommerceAgentConfig;
  private logger: Logger;
  private isRunning = false;
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor(config: ECommerceAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger(config.logging);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing E-commerce Agent...');
    this.setupEventHandlers();
    this.logger.info('E-commerce Agent initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.info('Starting E-commerce Agent...');
    
    // Start monitoring
    this.startInventorySync();
    this.startPriceMonitoring();
    
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('E-commerce Agent stopped');
    this.emit('stopped');
  }

  async syncInventory(): Promise<void> {
    this.logger.info('Syncing inventory across platforms...');
    
    if (this.config.platforms.shopify.enabled) {
      await this.syncShopifyInventory();
    }
    
    this.logger.info('Inventory sync completed');
  }

  async monitorPrices(): Promise<void> {
    this.logger.info('Monitoring product prices...');
    
    for (const product of this.products.values()) {
      const currentPrice = await this.getCurrentPrice(product);
      
      if (currentPrice !== product.price) {
        this.logger.info(`Price change detected for ${product.name}: ${product.price} -> ${currentPrice}`);
        product.price = currentPrice;
        product.lastUpdated = new Date();
        this.emit('priceChanged', product);
      }
    }
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    const product = this.products.get(id);
    if (!product) throw new Error('Product not found');
    
    Object.assign(product, data);
    product.lastUpdated = new Date();
    
    this.logger.info(`Product updated: ${id}`);
  }

  private async syncShopifyInventory(): Promise<void> {
    // Simulate Shopify inventory sync
    this.logger.debug('Syncing with Shopify...');
  }

  private async getCurrentPrice(product: Product): Promise<number> {
    // Simulate price checking
    return Math.random() * 100 + 10;
  }

  private startInventorySync(): void {
    if (this.config.automation.inventorySync) {
      setInterval(() => {
        this.syncInventory().catch(error => {
          this.logger.error('Inventory sync failed:', error);
        });
      }, this.config.monitoring.checkInterval);
    }
  }

  private startPriceMonitoring(): void {
    if (this.config.automation.priceMonitoring) {
      setInterval(() => {
        this.monitorPrices().catch(error => {
          this.logger.error('Price monitoring failed:', error);
        });
      }, this.config.monitoring.checkInterval);
    }
  }

  private setupEventHandlers(): void {
    this.on('priceChanged', (product: Product) => {
      this.logger.info(`Price changed for ${product.name}`);
    });
  }
}