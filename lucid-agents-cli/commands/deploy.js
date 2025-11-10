const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');

/**
 * Deploy agent to various platforms
 * @param {Object} config - Deployment configuration
 */
async function deployAgent(config) {
  const { agent, env = 'dev', name } = config;
  
  console.log(chalk.magenta.bold('🚀 Memulai deployment agent...\n'));
  
  // Validate agent directory
  const agentPath = validateAgentPath(agent);
  
  // Load agent configuration
  const agentConfig = loadAgentConfig(agentPath);
  
  // Show deployment summary
  showDeploymentSummary(agentPath, agentConfig, env);
  
  // Get deployment target
  const deploymentTarget = await getDeploymentTarget(agentConfig);
  
  // Execute deployment
  await executeDeployment(agentPath, agentConfig, env, deploymentTarget, name);
  
  // Show post-deployment instructions
  showPostDeploymentInstructions(agentConfig, env, deploymentTarget);
  
  return {
    success: true,
    agent: agentPath,
    environment: env,
    target: deploymentTarget,
    name: name || agentConfig.name
  };
}

/**
 * Validate agent path
 */
function validateAgentPath(agentPath) {
  if (!fs.existsSync(agentPath)) {
    throw new Error(`Agent directory tidak ditemukan: ${agentPath}`);
  }
  
  // Check for required files
  const requiredFiles = ['package.json', 'src/agents/agent.js', 'src/agents/agent.ts', 'src/agents/agent'];
  const hasAgentFile = requiredFiles.some(file => {
    const fullPath = path.join(agentPath, file);
    return fs.existsSync(fullPath);
  });
  
  if (!hasAgentFile) {
    throw new Error(`File agent tidak ditemukan di ${agentPath}. Pastikan struktur project benar.`);
  }
  
  return agentPath;
}

/**
 * Load agent configuration
 */
function loadAgentConfig(agentPath) {
  const packagePath = path.join(agentPath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json tidak ditemukan');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Load config files
  const configFiles = [
    'src/config/config.js',
    'src/config/config.ts',
    'config.js',
    'config.ts'
  ];
  
  let config = {};
  for (const configFile of configFiles) {
    const fullPath = path.join(agentPath, configFile);
    if (fs.existsSync(fullPath)) {
      try {
        const configData = require(fullPath);
        config = { ...config, ...configData };
        break;
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Warning: Could not load ${configFile}`));
      }
    }
  }
  
  return {
    ...config,
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    type: config.agentType || 'unknown',
    language: packageJson.main?.endsWith('.ts') ? 'typescript' : 'javascript'
  };
}

/**
 * Show deployment summary
 */
function showDeploymentSummary(agentPath, agentConfig, env) {
  const summary = chalk.blue(`
📋 Ringkasan Deployment:

📁 Agent: ${chalk.cyan.bold(agentConfig.name)}
🏷️  Versi: ${agentConfig.version}
💻 Bahasa: ${chalk.green(agentConfig.language)}
🤖 Tipe: ${chalk.yellow(agentConfig.type)}
🌍 Environment: ${chalk.magenta(env)}
📂 Path: ${agentPath}
  `);
  
  console.log(boxen(summary, { 
    padding: 1, 
    borderColor: 'blue',
    borderStyle: 'round'
  }));
}

/**
 * Get deployment target/platform
 */
async function getDeploymentTarget(agentConfig) {
  const targets = [
    {
      id: 'local',
      name: 'Local Development',
      description: 'Deploy untuk development lokal',
      icon: '💻',
      color: 'green'
    },
    {
      id: 'docker',
      name: 'Docker Container',
      description: 'Package dalam Docker container',
      icon: '🐳',
      color: 'blue'
    },
    {
      id: 'cloud',
      name: 'Cloud Platform',
      description: 'Deploy ke platform cloud (AWS, GCP, Azure)',
      icon: '☁️',
      color: 'yellow'
    },
    {
      id: 'serverless',
      name: 'Serverless Functions',
      description: 'Deploy sebagai serverless function',
      icon: '⚡',
      color: 'magenta'
    }
  ];
  
  console.log(chalk.cyan.bold('\n🎯 Pilih target deployment:\n'));
  
  targets.forEach((target, index) => {
    const color = getColor(target.color);
    const targetText = `${target.icon} ${target.name} - ${target.description}`;
    console.log(`${index + 1}. ${color(targetText)}`);
  });
  
  console.log();
  
  // For now, return 'local' as default
  // In a real implementation, this would be interactive
  return 'local';
}

/**
 * Execute deployment based on target
 */
async function executeDeployment(agentPath, agentConfig, env, target, name) {
  console.log(chalk.yellow(`\n🚀 Menjalankan deployment ke ${target}...\n`));
  
  try {
    switch (target) {
      case 'local':
        await deployLocal(agentPath, agentConfig, env);
        break;
      case 'docker':
        await deployDocker(agentPath, agentConfig, env, name);
        break;
      case 'cloud':
        await deployCloud(agentPath, agentConfig, env, name);
        break;
      case 'serverless':
        await deployServerless(agentPath, agentConfig, env, name);
        break;
      default:
        throw new Error(`Unknown deployment target: ${target}`);
    }
    
    console.log(chalk.green.bold('\n✅ Deployment berhasil!'));
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ Deployment gagal:'), error.message);
    throw error;
  }
}

/**
 * Deploy to local environment
 */
async function deployLocal(agentPath, agentConfig, env) {
  console.log(chalk.green('📦 Memasang dependencies...'));
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(agentPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(chalk.yellow('⚠️  Dependencies belum terinstall. Menjalankan npm install...'));
    // Note: In real implementation, you would run npm install here
  } else {
    console.log(chalk.green('✅ Dependencies sudah terinstall'));
  }
  
  // Check environment variables
  const envFile = path.join(agentPath, '.env');
  if (!fs.existsSync(envFile)) {
    const envExample = path.join(agentPath, '.env.example');
    if (fs.existsSync(envExample)) {
      console.log(chalk.yellow('⚠️  File .env belum ada. Menyalin dari .env.example...'));
      fs.copyFileSync(envExample, envFile);
      console.log(chalk.green('✅ File .env berhasil dibuat dari .env.example'));
      console.log(chalk.gray('💡 Edit file .env untuk mengkonfigurasi environment variables'));
    }
  }
  
  // Create logs directory
  const logsDir = path.join(agentPath, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Create startup scripts
  createStartupScripts(agentPath, agentConfig, env);
  
  console.log(chalk.blue('📝 Membuat scripts startup...'));
  console.log(chalk.green('✅ Scripts startup berhasil dibuat'));
  
  return { type: 'local', status: 'ready' };
}

/**
 * Deploy to Docker
 */
async function deployDocker(agentPath, agentConfig, env, name) {
  console.log(chalk.blue('🐳 Membuat Docker configuration...'));
  
  // Create Dockerfile
  const dockerfile = generateDockerfile(agentConfig);
  fs.writeFileSync(path.join(agentPath, 'Dockerfile'), dockerfile);
  
  // Create docker-compose.yml
  const composeFile = generateDockerCompose(agentConfig, env, name);
  fs.writeFileSync(path.join(agentPath, 'docker-compose.yml'), composeFile);
  
  // Create .dockerignore
  const dockerignore = generateDockerignore();
  fs.writeFileSync(path.join(agentPath, '.dockerignore'), dockerignore);
  
  console.log(chalk.green('✅ Docker configuration berhasil dibuat'));
  console.log(chalk.gray(`🚀 Jalankan: cd ${agentPath} && docker-compose up`));
  
  return { type: 'docker', status: 'configured' };
}

/**
 * Deploy to cloud platform
 */
async function deployCloud(agentPath, agentConfig, env, name) {
  console.log(chalk.blue('☁️  Mengkonfigurasi cloud deployment...'));
  
  // Create cloud deployment configuration
  const cloudConfig = generateCloudConfig(agentConfig, env, name);
  fs.writeFileSync(path.join(agentPath, 'cloud-config.json'), JSON.stringify(cloudConfig, null, 2));
  
  // Create deployment scripts
  const deployScript = generateCloudDeployScript(agentConfig, env, name);
  fs.writeFileSync(path.join(agentPath, 'deploy-cloud.sh'), deployScript);
  fs.chmodSync(path.join(agentPath, 'deploy-cloud.sh'), '755');
  
  // Create CI/CD configuration
  const githubWorkflow = generateGitHubWorkflow(agentConfig, env, name);
  fs.mkdirSync(path.join(agentPath, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(
    path.join(agentPath, '.github', 'workflows', 'deploy.yml'),
    githubWorkflow
  );
  
  console.log(chalk.green('✅ Cloud deployment configuration berhasil dibuat'));
  console.log(chalk.gray(`🚀 Jalankan: cd ${agentPath} && ./deploy-cloud.sh`));
  
  return { type: 'cloud', status: 'configured' };
}

/**
 * Deploy as serverless function
 */
async function deployServerless(agentPath, agentConfig, env, name) {
  console.log(chalk.blue('⚡ Mengkonfigurasi serverless deployment...'));
  
  // Create serverless.yml
  const serverlessConfig = generateServerlessConfig(agentConfig, env, name);
  fs.writeFileSync(path.join(agentPath, 'serverless.yml'), serverlessConfig);
  
  // Create handler file
  const handler = generateServerlessHandler(agentConfig);
  fs.writeFileSync(path.join(agentPath, 'handler.js'), handler);
  
  // Update package.json scripts
  const packagePath = path.join(agentPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'deploy:serverless': 'serverless deploy',
    'invoke:serverless': 'serverless invoke -f',
    'logs:serverless': 'serverless logs -f'
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  console.log(chalk.green('✅ Serverless configuration berhasil dibuat'));
  console.log(chalk.gray(`🚀 Jalankan: cd ${agentPath} && npm run deploy:serverless`));
  
  return { type: 'serverless', status: 'configured' };
}

/**
 * Create startup scripts
 */
function createStartupScripts(agentPath, agentConfig, env) {
  const scripts = {
    'start.sh': generateStartScript(agentConfig, env),
    'start-dev.sh': generateDevScript(agentConfig),
    'stop.sh': generateStopScript(agentConfig),
    'logs.sh': generateLogsScript(agentConfig)
  };
  
  Object.entries(scripts).forEach(([filename, content]) => {
    const scriptPath = path.join(agentPath, 'scripts', filename);
    fs.mkdirSync(path.dirname(scriptPath), { recursive: true });
    fs.writeFileSync(scriptPath, content);
    fs.chmodSync(scriptPath, '755');
  });
}

/**
 * Generate startup script
 */
function generateStartScript(agentConfig, env) {
  return `#!/bin/bash

# Lucid Agent Startup Script
# Generated for ${agentConfig.name}

set -e

echo "🚀 Starting ${agentConfig.name} agent..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your configuration"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Start the agent
echo "🌍 Environment: ${env}"
echo "📦 Starting ${agentConfig.name} v${agentConfig.version}..."

if [ -f "src/agents/agent.js" ]; then
    node src/agents/agent.js
elif [ -f "src/agents/agent.ts" ]; then
    npx tsx src/agents/agent.ts
else
    echo "❌ Agent file not found"
    exit 1
fi`;
}

/**
 * Generate dev script
 */
function generateDevScript(agentConfig) {
  return `#!/bin/bash

# Lucid Agent Development Startup Script
# Generated for ${agentConfig.name}

set -e

echo "🔧 Starting ${agentConfig.name} in development mode..."

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "🏃‍♂️ Running in development mode..."

if [ -f "src/agents/agent.js" ]; then
    node --watch src/agents/agent.js
elif [ -f "src/agents/agent.ts" ]; then
    npx tsx watch src/agents/agent.ts
else
    echo "❌ Agent file not found"
    exit 1
fi`;
}

/**
 * Generate stop script
 */
function generateStopScript(agentConfig) {
  return `#!/bin/bash

# Lucid Agent Stop Script
# Generated for ${agentConfig.name}

echo "🛑 Stopping ${agentConfig.name} agent..."

# Find and kill the process
PIDS=$(pgrep -f "agent.js|agent.ts")

if [ -n "$PIDS" ]; then
    echo "🔍 Found processes: $PIDS"
    echo "💀 Terminating processes..."
    kill -TERM $PIDS
    
    # Wait for graceful shutdown
    sleep 5
    
    # Force kill if still running
    REMAINING=$(pgrep -f "agent.js|agent.ts")
    if [ -n "$REMAINING" ]; then
        echo "⚡ Force killing remaining processes..."
        kill -9 $REMAINING
    fi
    
    echo "✅ Agent stopped successfully"
else
    echo "ℹ️  No running agent processes found"
fi`;
}

/**
 * Generate logs script
 */
function generateLogsScript(agentConfig) {
  return `#!/bin/bash

# Lucid Agent Logs Script
# Generated for ${agentConfig.name}

LOGS_DIR="logs"
LOG_FILE="${agentConfig.name}.log"

echo "📖 Showing logs for ${agentConfig.name}..."

if [ -d "$LOGS_DIR" ] && [ -f "$LOGS_DIR/$LOG_FILE" ]; then
    tail -f "$LOGS_DIR/$LOG_FILE"
else
    echo "📝 No logs directory found. Creating..."
    mkdir -p "$LOGS_DIR"
    echo "🔄 Start the agent to generate logs"
fi`;
}

/**
 * Generate Dockerfile
 */
function generateDockerfile(agentConfig) {
  const baseImage = agentConfig.language === 'typescript' 
    ? 'node:18-alpine' 
    : 'node:18-alpine';
  
  return `# Dockerfile for ${agentConfig.name}
# Generated by Lucid Agents CLI

FROM ${baseImage}

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY .env.example ./

# Create logs directory
RUN mkdir -p logs

# Expose port (if needed)
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start command
CMD ["node", "src/agents/agent.js"]`;
}

/**
 * Generate Docker Compose configuration
 */
function generateDockerCompose(agentConfig, env, name) {
  return `# Docker Compose for ${agentConfig.name}
# Generated by Lucid Agents CLI

version: '3.8'

services:
  ${name || agentConfig.name}:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${name || agentConfig.name}
    environment:
      - NODE_ENV=${env}
      - LOG_LEVEL=info
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    networks:
      - lucid-agents-network

  # Optional: Add Redis for job queues
  # redis:
  #   image: redis:7-alpine
  #   container_name: ${name || agentConfig.name}-redis
  #   restart: unless-stopped
  #   networks:
  #     - lucid-agents-network

networks:
  lucid-agents-network:
    driver: bridge

volumes:
  logs:
  data:`;
}

/**
 * Generate .dockerignore
 */
function generateDockerignore() {
  return `# Docker ignore file
# Generated by Lucid Agents CLI

node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
logs
.nyc_output
.coverage
.cache
.DS_Store
Thumbs.db

# IDE files
.vscode
.idea
*.swp
*.swo

# Test files
tests
*.test.js
*.test.ts
__tests__

# Documentation
docs
*.md`;
}

/**
 * Generate cloud configuration
 */
function generateCloudConfig(agentConfig, env, name) {
  return {
    name: name || agentConfig.name,
    version: agentConfig.version,
    environment: env,
    runtime: agentConfig.language === 'typescript' ? 'nodejs18.x' : 'nodejs18.x',
    memory: 512,
    timeout: 300,
    region: 'us-east-1',
    environmentVariables: {
      NODE_ENV: env,
      AGENT_NAME: agentConfig.name,
      AGENT_TYPE: agentConfig.type
    },
    scaling: {
      minInstances: 1,
      maxInstances: 10,
      targetUtilization: 70
    },
    monitoring: {
      logRetention: 30,
      metricsEnabled: true,
      alerts: [
        {
          name: 'HighErrorRate',
          condition: 'error_rate > 5%',
          action: 'notify'
        }
      ]
    }
  };
}

/**
 * Generate cloud deployment script
 */
function generateCloudDeployScript(agentConfig, env, name) {
  return `#!/bin/bash

# Cloud Deployment Script for ${agentConfig.name}
# Generated by Lucid Agents CLI

set -e

echo "☁️  Deploying ${agentConfig.name} to cloud platform..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Load configuration
if [ -f cloud-config.json ]; then
    echo "📋 Loading cloud configuration..."
    export $(cat cloud-config.json | jq -r 'to_entries | map("\\(.key)=\\(.value)") | .[]')
fi

# Build the application
echo "🔨 Building application..."
if [ -f "src/agents/agent.ts" ]; then
    npm run build
fi

# Create deployment package
echo "📦 Creating deployment package..."
zip -r ${name || agentConfig.name}.zip . -x "node_modules/*" ".git/*" "*.log"

# Deploy to AWS Lambda (example)
echo "🚀 Deploying to AWS Lambda..."
aws lambda create-function \\
    --function-name ${name || agentConfig.name} \\
    --runtime nodejs18.x \\
    --role arn:aws:iam::\\$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \\
    --handler index.handler \\
    --zip-file fileb://${name || agentConfig.name}.zip \\
    --environment Variables="NODE_ENV=${env},AGENT_NAME=${agentConfig.name}" \\
    --timeout 300 \\
    --memory-size 512

# Clean up
rm ${name || agentConfig.name}.zip

echo "✅ Deployment completed successfully!"`;
}

/**
 * Generate GitHub Actions workflow
 */
function generateGitHubWorkflow(agentConfig, env, name) {
  return `# GitHub Actions Workflow for ${agentConfig.name}
# Generated by Lucid Agents CLI

name: Deploy ${agentConfig.name}

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  AGENT_NAME: ${name || agentConfig.name}
  ENVIRONMENT: ${env}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      if: contains(agent.language, 'typescript')
    
    - name: Deploy to AWS Lambda
      env:
        AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_REGION: us-east-1
      run: |
        zip -r \${{ env.AGENT_NAME }}.zip . -x "node_modules/*" ".git/*" "*.log"
        aws lambda update-function-code \\
          --function-name \${{ env.AGENT_NAME }} \\
          --zip-file fileb://\${{ env.AGENT_NAME }}.zip
        rm \${{ env.AGENT_NAME }}.zip`;
}

/**
 * Generate Serverless configuration
 */
function generateServerlessConfig(agentConfig, env, name) {
  return `# Serverless configuration for ${agentConfig.name}
# Generated by Lucid Agents CLI

service: ${name || agentConfig.name}

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${env}
  environment:
    NODE_ENV: ${env}
    AGENT_NAME: ${agentConfig.name}
    AGENT_TYPE: ${agentConfig.type}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
          Resource: arn:aws:logs:*:*:*

functions:
  main:
    handler: handler.main
    timeout: 300
    memorySize: 512
    events:
      - schedule:
          rate: rate(1 minute)
          enabled: true
      - http:
          path: /health
          method: get
          cors: true

plugins:
  - serverless-offline

resources:
  Resources:
    LogGroup:
      Type: AWS::Logs::LogGroup
      Properties:
        LogGroupName: /aws/lambda/\${self:service}-\${self:provider.stage}-main
        RetentionInDays: 30`;
}

/**
 * Generate Serverless handler
 */
function generateServerlessHandler(agentConfig) {
  return `// Serverless handler for ${agentConfig.name}
// Generated by Lucid Agents CLI

const { ${agentConfig.language === 'typescript' ? capitalizeFirst(agentConfig.name) : capitalizeFirst(agentConfig.name)}Agent } = require('./src/agents/agent');

const agent = new ${agentConfig.language === 'typescript' ? capitalizeFirst(agentConfig.name) : capitalizeFirst(agentConfig.name)}Agent({
  agentName: process.env.AGENT_NAME,
  agentType: process.env.AGENT_TYPE,
  environment: 'serverless'
});

module.exports.main = async (event) => {
  try {
    console.log('Starting serverless agent execution...');
    
    // Process tasks
    await agent.processTasks();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Agent executed successfully',
        agent: process.env.AGENT_NAME,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Agent execution failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Agent execution failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Health check endpoint
module.exports.health = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'healthy',
      agent: process.env.AGENT_NAME,
      timestamp: new Date().toISOString()
    })
  };
};

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}`;
}

/**
 * Show post-deployment instructions
 */
function showPostDeploymentInstructions(agentConfig, env, target) {
  const instructions = chalk.green(`
🎉 Deployment berhasil selesai!

Agent ${chalk.cyan.bold(agentConfig.name)} telah berhasil di-deploy ke ${target} environment.

📋 Langkah selanjutnya:
  1. Monitor agent menggunakan logs
  2. Test functionality dengan command test
  3. Monitor performance dan metrics
  4. Setup alerting jika diperlukan

🔧 Perintah yang berguna:
  `);
  
  console.log(boxen(instructions, { 
    padding: 1, 
    borderColor: 'green',
    borderStyle: 'round'
  }));
  
  const commands = {
    local: [
      'npm start              - Start agent',
      'npm run start:dev     - Start in development mode',
      './scripts/logs.sh     - View logs',
      './scripts/stop.sh     - Stop agent'
    ],
    docker: [
      'docker-compose up -d  - Start in background',
      'docker-compose logs   - View logs',
      'docker-compose down   - Stop containers'
    ],
    cloud: [
      'aws lambda invoke      - Invoke function',
      'aws logs tail         - View CloudWatch logs',
      './deploy-cloud.sh     - Redeploy'
    ],
    serverless: [
      'npm run deploy:serverless   - Deploy to cloud',
      'npm run invoke:serverless   - Test invoke',
      'npm run logs:serverless     - View logs'
    ]
  };
  
  commands[target].forEach(command => {
    console.log(chalk.yellow(`  ${command}`));
  });
  
  console.log();
  
  // Show monitoring information
  const monitoring = chalk.blue(`
📊 Monitoring & Maintenance:

• Logs location: logs/ (local), CloudWatch (AWS)
• Health endpoint: GET /health
• Metrics: CPU, memory, execution time
• Alerts: Error rate, response time
  `);
  console.log(monitoring);
}

/**
 * Get color function
 */
function getColor(colorName) {
  const colors = {
    green: chalk.green,
    blue: chalk.blue,
    yellow: chalk.yellow,
    magenta: chalk.magenta,
    red: chalk.red
  };
  return colors[colorName] || chalk.gray;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = {
  deployAgent
};