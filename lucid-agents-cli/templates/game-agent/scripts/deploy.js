#!/usr/bin/env node

/**
 * Deployment Script for Game Agent
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

class DeploymentManager {
  async deploy() {
    console.log('🎮 Deploying Game Agent...');
    
    // Build project
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create logs directory
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs', { recursive: true });
    }
    
    console.log('✅ Game Agent deployed successfully');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const deployment = new DeploymentManager();
  deployment.deploy();
}