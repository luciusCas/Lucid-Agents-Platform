const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');
const { AGENT_TYPES } = require('../bin/create-lucid-agent');

/**
 * Create a new Lucid Agent
 * @param {Object} config - Agent configuration
 */
async function createAgent(config) {
  const { name, type, directory, language = 'javascript', features = [] } = config;
  
  console.log(chalk.cyan.bold('🛠️ Memulai pembuatan agent...\n'));
  
  // Validate configuration
  validateConfig(config);
  
  // Create agent directory structure
  const agentDir = createAgentDirectory(directory, name);
  
  // Generate agent files
  await generateAgentFiles(agentDir, config);
  
  // Show success message
  showSuccessMessage(name, type, agentDir, language);
  
  // Show next steps
  showNextSteps(agentDir, features);
  
  return {
    success: true,
    name,
    type,
    directory: agentDir,
    language
  };
}

/**
 * Validate agent configuration
 */
function validateConfig(config) {
  const { name, type } = config;
  
  if (!name || name.trim().length === 0) {
    throw new Error('Nama agent diperlukan');
  }
  
  if (!AGENT_TYPES[type]) {
    throw new Error(`Tipe agent tidak valid: ${type}. Pilih dari: ${Object.keys(AGENT_TYPES).join(', ')}`);
  }
}

/**
 * Create agent directory structure
 */
function createAgentDirectory(baseDir, agentName) {
  const agentDir = path.join(baseDir, agentName);
  
  // Create base directory
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }
  
  // Create subdirectories
  const subdirs = [
    'src',
    'src/agents',
    'src/config',
    'src/utils',
    'tests',
    'docs',
    'examples'
  ];
  
  subdirs.forEach(subdir => {
    const fullPath = path.join(agentDir, subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  return agentDir;
}

/**
 * Generate agent files
 */
async function generateAgentFiles(agentDir, config) {
  const { name, type, language = 'javascript', features = [] } = config;
  
  console.log(chalk.blue('📁 Membuat struktur file...'));
  
  // Generate package.json
  const packageJson = generatePackageJson(name, type, language, features);
  fs.writeFileSync(
    path.join(agentDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Generate main agent file
  const mainAgentFile = generateMainAgentFile(name, type, language, features);
  const agentFileName = language === 'typescript' ? 'agent.ts' : 'agent.js';
  fs.writeFileSync(
    path.join(agentDir, 'src', 'agents', agentFileName),
    mainAgentFile
  );
  
  // Generate configuration file
  const configFile = generateConfigFile(name, type, language, features);
  const configFileName = language === 'typescript' ? 'config.ts' : 'config.js';
  fs.writeFileSync(
    path.join(agentDir, 'src', 'config', configFileName),
    configFile
  );
  
  // Generate README
  const readme = generateReadme(name, type, language, features);
  fs.writeFileSync(
    path.join(agentDir, 'README.md'),
    readme
  );
  
  // Generate .gitignore
  const gitignore = generateGitignore(language);
  fs.writeFileSync(
    path.join(agentDir, '.gitignore'),
    gitignore
  );
  
  // Generate environment file
  const envExample = generateEnvExample();
  fs.writeFileSync(
    path.join(agentDir, '.env.example'),
    envExample
  );
  
  // Generate feature-specific files
  await generateFeatureFiles(agentDir, language, features);
  
  console.log(chalk.green('✅ File-file berhasil dibuat!'));
}

/**
 * Generate package.json
 */
function generatePackageJson(name, type, language, features) {
  const basePackage = {
    name: `lucid-agent-${name.toLowerCase()}`,
    version: '0.1.0',
    description: `${AGENT_TYPES[type].name}: ${AGENT_TYPES[type].description}`,
    main: `src/agents/${language === 'typescript' ? 'agent.ts' : 'agent.js'}`,
    scripts: {
      start: 'node src/agents/agent.js',
      'start:dev': language === 'typescript' ? 'tsx watch src/agents/agent.ts' : 'node --watch src/agents/agent.js',
      test: 'jest',
      'test:watch': 'jest --watch',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      build: language === 'typescript' ? 'tsc' : 'echo "No build step required for JavaScript"',
      'build:dev': 'npm run build'
    },
    keywords: [
      'lucid-agents',
      'ai-agent',
      'automation',
      type
    ],
    author: 'Lucid Agents Team',
    license: 'MIT',
    dependencies: {
      'lucid-agents-core': '^1.0.0'
    },
    devDependencies: {}
  };
  
  // Add language-specific dependencies
  if (language === 'typescript') {
    basePackage.devDependencies = {
      ...basePackage.devDependencies,
      typescript: '^5.0.0',
      'tsx': '^4.0.0',
      '@types/node': '^20.0.0'
    };
  } else {
    basePackage.devDependencies = {
      ...basePackage.devDependencies,
      eslint: '^8.0.0'
    };
  }
  
  // Add feature-specific dependencies
  if (features.includes('api')) {
    basePackage.dependencies = {
      ...basePackage.dependencies,
      axios: '^1.6.0',
      'node-fetch': '^3.0.0'
    };
  }
  
  if (features.includes('database')) {
    basePackage.dependencies = {
      ...basePackage.dependencies,
      'prisma': '^5.0.0',
      '@prisma/client': '^5.0.0'
    };
    basePackage.devDependencies = {
      ...basePackage.devDependencies,
      prisma: '^5.0.0'
    };
  }
  
  if (features.includes('auth')) {
    basePackage.dependencies = {
      ...basePackage.dependencies,
      jsonwebtoken: '^9.0.0',
      bcrypt: '^5.1.0',
      passport: '^0.6.0'
    };
  }
  
  if (features.includes('testing')) {
    basePackage.devDependencies = {
      ...basePackage.devDependencies,
      jest: '^29.0.0',
      'jest-environment-node': '^29.0.0',
      '@types/jest': language === 'typescript' ? '^29.0.0' : undefined,
    }.filter(Boolean);
    
    basePackage.scripts = {
      ...basePackage.scripts,
      test: 'jest --coverage',
      'test:ci': 'jest --ci --coverage --watchAll=false'
    };
  }
  
  return basePackage;
}

/**
 * Generate main agent file
 */
function generateMainAgentFile(name, type, language, features) {
  const extension = language === 'typescript' ? 'ts' : 'js';
  const importStatement = language === 'typescript' 
    ? "import { LucidAgent, AgentConfig } from 'lucid-agents-core';"
    : "const { LucidAgent, AgentConfig } = require('lucid-agents-core');";
  
  const typeClass = language === 'typescript' 
    ? `class ${capitalizeFirst(name)}Agent extends LucidAgent`
    : `class ${capitalizeFirst(name)}Agent extends LucidAgent`;
  
  const configType = language === 'typescript' ? ': AgentConfig' : '';
  
  const configImport = language === 'typescript'
    ? "import { config } from '../config/config';"
    : "const { config } = require('../config/config');";
  
  return `${importStatement}
${configImport}

/**
 * ${AGENT_TYPES[type].name}
 * ${AGENT_TYPES[type].description}
 */
${typeClass} {
  constructor(config${configType}) {
    super({
      ...config,
      ...config,
      agentName: '${name}',
      agentType: '${type}'
    });
  }
  
  /**
   * Initialize the agent
   */
  async initialize() {
    try {
      console.log('🚀 Initializing ${name} agent...');
      
      // Initialize agent-specific logic here
      await this.setupEventListeners();
      await this.loadState();
      
      console.log('✅ Agent initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize agent:', error);
      return false;
    }
  }
  
  /**
   * Start the agent main loop
   */
  async start() {
    console.log('🎯 Starting ${name} agent...');
    
    try {
      await this.initialize();
      
      // Main agent loop
      while (this.isRunning) {
        await this.processTasks();
        await this.sleep(1000); // Wait 1 second between iterations
      }
      
    } catch (error) {
      console.error('❌ Agent runtime error:', error);
    }
  }
  
  /**
   * Process pending tasks
   */
  async processTasks() {
    // Implement task processing logic based on agent type
    switch ('${type}') {
      case 'macro':
        await this.processMacroTasks();
        break;
      case 'arbitrage':
        await this.processArbitrageTasks();
        break;
      case 'game':
        await this.processGameTasks();
        break;
      case 'creative':
        await this.processCreativeTasks();
        break;
      case 'e-commerce':
        await this.processEcommerceTasks();
        break;
      default:
        await this.processGenericTasks();
    }
  }
  
  /**
   * Handle shutdown gracefully
   */
  async shutdown() {
    console.log('🛑 Shutting down ${name} agent...');
    
    try {
      await this.saveState();
      await this.cleanup();
      
      console.log('✅ Agent shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
  
  // Agent-specific methods
  
  ${generateAgentSpecificMethods(type, language)}
}

// Initialize and start the agent
async function main() {
  const agent = new ${capitalizeFirst(name)}Agent();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await agent.shutdown();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await agent.shutdown();
    process.exit(0);
  });
  
  try {
    await agent.start();
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Start the agent if this file is run directly
if (require.main === module) {
  main();
}

module.exports = { ${capitalizeFirst(name)}Agent };`;
}

/**
 * Generate configuration file
 */
function generateConfigFile(name, type, language, features) {
  const extension = language === 'typescript' ? 'ts' : 'js';
  
  const typeDefinition = language === 'typescript' 
    ? `export interface AgentConfig {
  agentName: string;
  agentType: string;
  maxRetries: number;
  timeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  ${features.includes('api') ? 'apiKey?: string;' : ''}
  ${features.includes('database') ? 'databaseUrl?: string;' : ''}
  ${features.includes('auth') ? 'jwtSecret?: string;' : ''}
}` : '';
  
  const configObject = language === 'typescript' ? 'export const config: AgentConfig = ' : 'const config = ';
  
  const config = `${typeDefinition}

${configObject}{
  agentName: '${name}',
  agentType: '${type}',
  maxRetries: 3,
  timeout: 30000,
  logLevel: 'info',
  ${features.includes('api') ? "apiKey: process.env.API_KEY || ''," : ''}
  ${features.includes('database') ? "databaseUrl: process.env.DATABASE_URL || ''," : ''}
  ${features.includes('auth') ? "jwtSecret: process.env.JWT_SECRET || ''," : ''}
};

${language === 'typescript' ? 'export { config };' : 'module.exports = { config };'}`;
  
  return config;
}

/**
 * Generate agent-specific methods based on type
 */
function generateAgentSpecificMethods(type, language) {
  const methods = {
    macro: `
  async processMacroTasks() {
    // Macro agent specific logic
    console.log('🤖 Processing macro tasks...');
    
    // Example: Check for repetitive tasks to automate
    const tasks = await this.getPendingTasks('macro');
    
    for (const task of tasks) {
      try {
        await this.executeMacroTask(task);
        await this.markTaskComplete(task.id);
      } catch (error) {
        console.error('Failed to process macro task:', error);
        await this.markTaskFailed(task.id, error.message);
      }
    }
  }
  
  async executeMacroTask(task) {
    // Implement specific macro task execution
    console.log('⚡ Executing macro task:', task.name);
  }`,
    
    arbitrage: `
  async processArbitrageTasks() {
    // Arbitrage agent specific logic
    console.log('💹 Scanning for arbitrage opportunities...');
    
    const opportunities = await this.scanMarkets();
    
    for (const opportunity of opportunities) {
      if (opportunity.profit > 0.01) { // 1% minimum profit
        await this.executeArbitrage(opportunity);
      }
    }
  }
  
  async scanMarkets() {
    // Implement market scanning logic
    return [];
  }
  
  async executeArbitrage(opportunity) {
    console.log('🎯 Executing arbitrage:', opportunity);
  }`,
    
    game: `
  async processGameTasks() {
    // Game agent specific logic
    console.log('🎮 Processing game tasks...');
    
    const gameState = await this.getGameState();
    const bestMove = await this.calculateBestMove(gameState);
    
    if (bestMove) {
      await this.executeMove(bestMove);
    }
  }
  
  async getGameState() {
    // Implement game state retrieval
    return {};
  }
  
  async calculateBestMove(state) {
    // Implement strategy calculation
    return null;
  }`,
    
    creative: `
  async processCreativeTasks() {
    // Creative agent specific logic
    console.log('🎨 Processing creative tasks...');
    
    const prompts = await this.getCreativePrompts();
    
    for (const prompt of prompts) {
      const creation = await this.generateContent(prompt);
      await this.saveCreation(creation);
    }
  }
  
  async generateContent(prompt) {
    // Implement content generation logic
    return { prompt, content: 'Generated content', timestamp: new Date() };
  }`,
    
    'e-commerce': `
  async processEcommerceTasks() {
    // E-commerce agent specific logic
    console.log('🛒 Processing e-commerce tasks...');
    
    const orders = await this.getPendingOrders();
    const products = await this.getProducts();
    
    // Process orders
    for (const order of orders) {
      await this.processOrder(order);
    }
    
    // Optimize product listings
    await this.optimizeProductListings(products);
  }
  
  async processOrder(order) {
    console.log('📦 Processing order:', order.id);
    // Implement order processing logic
  }`
  };
  
  return methods[type] || `
  async processGenericTasks() {
    console.log('⚙️ Processing generic tasks...');
  }`;
}

/**
 * Generate README file
 */
function generateReadme(name, type, language, features) {
  return `# ${name} - ${AGENT_TYPES[type].name}

${AGENT_TYPES[type].description}

## Features

- ✅ Agent type: ${AGENT_TYPES[type].name}
- ✅ Language: ${language}
- ${features.includes('api') ? '- ✅ API Integration' : '- ⚪ API Integration'}
- ${features.includes('database') ? '- ✅ Database Integration' : '- ⚪ Database Integration'}
- ${features.includes('auth') ? '- ✅ Authentication' : '- ⚪ Authentication'}
- ${features.includes('logging') ? '- ✅ Logging System' : '- ⚪ Logging System'}
- ${features.includes('testing') ? '- ✅ Testing Setup' : '- ⚪ Testing Setup'}

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Copy environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Edit \`.env\` file with your configuration.

## Usage

### Start the agent:
\`\`\`bash
npm start
\`\`\`

### Development mode:
\`\`\`bash
npm run start:dev
\`\`\`

### Run tests:
\`\`\`bash
npm test
\`\`\`

## Configuration

The agent configuration is located in \`src/config/config.${language === 'typescript' ? 'ts' : 'js'}\`.

Modify this file to customize agent behavior:

- Agent name and type
- Retry settings
- Timeout configurations
- API keys and secrets
- Database connections

## Agent Type: ${AGENT_TYPES[type].name}

This agent is specifically designed for: ${AGENT_TYPES[type].description}

### Key Capabilities

${getTypeSpecificCapabilities(type)}

## Development

### Project Structure
\`\`\`
├── src/
│   ├── agents/          # Main agent files
│   ├── config/          # Configuration files
│   └── utils/           # Utility functions
├── tests/               # Test files
├── docs/                # Documentation
├── examples/            # Usage examples
└── README.md
\`\`\`

### Adding Custom Logic

1. Extend the agent class in \`src/agents/agent.${language === 'typescript' ? 'ts' : 'js'}\`
2. Override methods to add custom behavior
3. Add new methods for specific functionality

## License

MIT

## Support

For support and questions about ${AGENT_TYPES[type].name}, please refer to the [Lucid Agents documentation](https://docs.lucid-agents.com).`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(language) {
  let gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage

# nyc test coverage
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/`;

  if (language === 'typescript') {
    gitignore += `

# TypeScript build output
dist/
*.tsbuildinfo`;
  }

  return gitignore;
}

/**
 * Generate .env.example
 */
function generateEnvExample() {
  return `# Lucid Agent Environment Configuration

# Agent Configuration
AGENT_NAME=my-agent
AGENT_TYPE=macro
LOG_LEVEL=info

# API Configuration
API_KEY=your_api_key_here
API_BASE_URL=https://api.example.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/lucid_agents
DATABASE_SSL=false

# Authentication
JWT_SECRET=your_jwt_secret_here
AUTH_PROVIDER=local

# Logging
LOG_FILE=logs/agent.log
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=5

# Agent-specific settings
MAX_RETRIES=3
TIMEOUT=30000
HEARTBEAT_INTERVAL=60000`;
}

/**
 * Generate feature-specific files
 */
async function generateFeatureFiles(agentDir, language, features) {
  // Implement feature-specific file generation
  console.log(chalk.blue('📦 Generating feature-specific files...'));
}

/**
 * Show success message
 */
function showSuccessMessage(name, type, agentDir, language) {
  const message = chalk.green(`
🎉 Agent '${name}' berhasil dibuat!

📁 Lokasi: ${agentDir}
🏷️ Tipe: ${AGENT_TYPES[type].name}
💻 Bahasa: ${capitalizeFirst(language)}

📚 Langkah selanjutnya:
  1. cd ${agentDir}
  2. npm install
  3. cp .env.example .env
  4. Edit .env dengan konfigurasi Anda
  5. npm start
  `);
  
  console.log(boxen(message, { 
    padding: 1, 
    borderColor: 'green',
    borderStyle: 'round'
  }));
}

/**
 * Show next steps
 */
function showNextSteps(agentDir, features) {
  console.log(chalk.cyan('\n🚀 Fitur yang telah diaktifkan:'));
  features.forEach(feature => {
    const featureIcons = {
      api: '🌐 API Integration',
      database: '🗄️ Database Integration',
      auth: '🔐 Authentication',
      logging: '📝 Logging System',
      testing: '🧪 Testing Setup'
    };
    console.log(`  ✅ ${featureIcons[feature] || feature}`);
  });
  
  if (features.length === 0) {
    console.log(chalk.gray('  ℹ️ Tidak ada fitur tambahan yang diaktifkan'));
  }
  
  console.log(chalk.gray('\n📖 Baca README.md untuk dokumentasi lengkap'));
  console.log(chalk.gray('🛠️ Lihat file di src/agents/ untuk mulai coding'));
}

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get type-specific capabilities
 */
function getTypeSpecificCapabilities(type) {
  const capabilities = {
    macro: '- Task automation and scheduling\n- Process complex workflows\n- Handle repetitive tasks efficiently',
    arbitrage: '- Real-time market monitoring\n- Opportunity detection algorithms\n- Risk assessment and management',
    game: '- Game state analysis\n- Strategy optimization\n- Automated gameplay decisions',
    creative: '- Content generation\n- Creative task automation\n- Style and format adaptation',
    'e-commerce': '- Order management\n- Product optimization\n- Customer service automation'
  };
  
  return capabilities[type] || '- Generic task automation\n- Configurable behavior\n- Extensible architecture';
}

module.exports = {
  createAgent
};