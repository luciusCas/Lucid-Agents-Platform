#!/usr/bin/env node

/**
 * Deployment Script for Creative Agent
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

class DeploymentManager {
  async deploy() {
    console.log('🎨 Deploying Creative Agent...');
    
    // Build project
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create directories
    ['logs', 'output'].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log('✅ Creative Agent deployed successfully');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const deployment = new DeploymentManager();
  deployment.deploy();
}