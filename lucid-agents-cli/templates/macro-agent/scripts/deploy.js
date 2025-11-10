#!/usr/bin/env node

/**
 * Deployment Script for Macro Agent
 * Handles deployment to various platforms and environments
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PLATFORMS = {
  LOCAL: 'local',
  DOCKER: 'docker',
  AWS: 'aws',
  GCP: 'gcp',
  AZURE: 'azure',
  RAILWAY: 'railway',
  VERCEL: 'vercel'
};

const DEPLOYMENT_CONFIG = {
  local: {
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    healthCheck: 'http://localhost:3000/health'
  },
  docker: {
    buildCommand: 'docker build -t macro-agent .',
    startCommand: 'docker run -d -p 3000:3000 --name macro-agent macro-agent',
    healthCheck: 'http://localhost:3000/health'
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    lambdaFunction: process.env.AWS_LAMBDA_FUNCTION || 'macro-agent',
    memorySize: 512,
    timeout: 300
  },
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    functionName: 'macro-agent',
    region: 'us-central1'
  },
  azure: {
    resourceGroup: process.env.AZURE_RESOURCE_GROUP,
    functionApp: 'macro-agent'
  }
};

class DeploymentManager {
  constructor() {
    this.platform = process.env.DEPLOYMENT_PLATFORM || PLATFORMS.LOCAL;
    this.environment = process.env.NODE_ENV || 'production';
  }

  async deploy() {
    try {
      console.log(`🚀 Starting deployment to ${this.platform}...`);
      
      // Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Build project
      await this.buildProject();
      
      // Deploy based on platform
      await this.deployToPlatform();
      
      // Post-deployment verification
      await this.postDeploymentVerification();
      
      console.log('✅ Deployment completed successfully!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 18) {
      throw new Error('Node.js 18+ is required');
    }
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found');
    }
    
    // Check if source files exist
    if (!fs.existsSync('src')) {
      throw new Error('src directory not found');
    }
    
    // Check environment file
    if (!fs.existsSync('.env') && this.environment === 'production') {
      console.warn('⚠️  .env file not found. Please ensure environment variables are set.');
    }
    
    console.log('✅ Pre-deployment checks passed');
  }

  async buildProject() {
    console.log('🔨 Building project...');
    
    try {
      // Install dependencies
      console.log('Installing dependencies...');
      execSync('npm ci', { stdio: 'inherit' });
      
      // Run linting
      console.log('Running linter...');
      execSync('npm run lint', { stdio: 'inherit' });
      
      // Run tests
      console.log('Running tests...');
      execSync('npm test', { stdio: 'inherit' });
      
      // Build TypeScript
      console.log('Building TypeScript...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('✅ Build completed successfully');
      
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async deployToPlatform() {
    switch (this.platform) {
      case PLATFORMS.LOCAL:
        await this.deployLocal();
        break;
      case PLATFORMS.DOCKER:
        await this.deployDocker();
        break;
      case PLATFORMS.AWS:
        await this.deployAWS();
        break;
      case PLATFORMS.GCP:
        await this.deployGCP();
        break;
      case PLATFORMS.AZURE:
        await this.deployAzure();
        break;
      case PLATFORMS.RAILWAY:
        await this.deployRailway();
        break;
      case PLATFORMS.VERCEL:
        await this.deployVercel();
        break;
      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  async deployLocal() {
    console.log('🏠 Deploying locally...');
    
    // Ensure directories exist
    const dirs = ['logs', 'data', 'tmp'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    console.log('✅ Local deployment ready');
  }

  async deployDocker() {
    console.log('🐳 Deploying with Docker...');
    
    // Build Docker image
    execSync('docker build -t macro-agent .', { stdio: 'inherit' });
    
    // Stop existing container if running
    try {
      execSync('docker stop macro-agent', { stdio: 'pipe' });
      execSync('docker rm macro-agent', { stdio: 'pipe' });
    } catch {
      // Container doesn't exist, continue
    }
    
    // Start new container
    const dockerRunCmd = `docker run -d --name macro-agent -p 3000:3000 -v $(pwd)/logs:/app/logs -v $(pwd)/data:/app/data macro-agent`;
    execSync(dockerRunCmd, { stdio: 'inherit' });
    
    console.log('✅ Docker deployment completed');
  }

  async deployAWS() {
    console.log('☁️  Deploying to AWS...');
    
    const config = DEPLOYMENT_CONFIG.aws;
    
    // Check if AWS CLI is installed
    try {
      execSync('aws --version', { stdio: 'pipe' });
    } catch {
      throw new Error('AWS CLI is required for AWS deployment');
    }
    
    // Package for Lambda
    console.log('Packaging for Lambda...');
    execSync('npm run package:lambda', { stdio: 'inherit' });
    
    // Deploy Lambda function
    console.log('Deploying Lambda function...');
    const deployCmd = `aws lambda update-function-code --function-name ${config.lambdaFunction} --zip-file fileb://lambda-package.zip`;
    execSync(deployCmd, { stdio: 'inherit' });
    
    console.log('✅ AWS deployment completed');
  }

  async deployGCP() {
    console.log('🌐 Deploying to Google Cloud...');
    
    const config = DEPLOYMENT_CONFIG.gcp;
    
    if (!config.projectId) {
      throw new Error('GCP_PROJECT_ID environment variable is required');
    }
    
    // Check if gcloud CLI is installed
    try {
      execSync('gcloud --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Google Cloud CLI is required for GCP deployment');
    }
    
    // Deploy Cloud Function
    console.log('Deploying Cloud Function...');
    const deployCmd = `gcloud functions deploy ${config.functionName} --source . --trigger-http --runtime nodejs18 --region ${config.region} --allow-unauthenticated`;
    execSync(deployCmd, { stdio: 'inherit' });
    
    console.log('✅ GCP deployment completed');
  }

  async deployAzure() {
    console.log('🔷 Deploying to Azure...');
    
    const config = DEPLOYMENT_CONFIG.azure;
    
    // Check if Azure CLI is installed
    try {
      execSync('az --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Azure CLI is required for Azure deployment');
    }
    
    // Deploy to Azure Functions
    console.log('Deploying Azure Function...');
    const deployCmd = `func azure functionapp publish ${config.functionApp}`;
    execSync(deployCmd, { stdio: 'inherit' });
    
    console.log('✅ Azure deployment completed');
  }

  async deployRailway() {
    console.log('🚂 Deploying to Railway...');
    
    // Check if Railway CLI is installed
    try {
      execSync('railway --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Railway CLI is required for Railway deployment');
    }
    
    // Deploy to Railway
    console.log('Deploying to Railway...');
    execSync('railway deploy', { stdio: 'inherit' });
    
    console.log('✅ Railway deployment completed');
  }

  async deployVercel() {
    console.log('▲ Deploying to Vercel...');
    
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch {
      throw new Error('Vercel CLI is required for Vercel deployment');
    }
    
    // Deploy to Vercel
    console.log('Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('✅ Vercel deployment completed');
  }

  async postDeploymentVerification() {
    console.log('🔍 Running post-deployment verification...');
    
    // Health check for local and docker deployments
    if ([PLATFORMS.LOCAL, PLATFORMS.DOCKER].includes(this.platform)) {
      await this.waitForService();
      await this.checkHealthEndpoint();
    }
    
    console.log('✅ Post-deployment verification passed');
  }

  async waitForService() {
    console.log('⏳ Waiting for service to be ready...');
    const maxAttempts = 30;
    const healthCheck = DEPLOYMENT_CONFIG.local.healthCheck;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(healthCheck);
        if (response.ok) {
          console.log('✅ Service is ready');
          return;
        }
      } catch {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Service failed to start within timeout period');
  }

  async checkHealthEndpoint() {
    try {
      const response = await fetch('http://localhost:3000/health');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      console.log('✅ Health check passed');
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

// Run deployment if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const deployment = new DeploymentManager();
  deployment.deploy();
}

export default DeploymentManager;