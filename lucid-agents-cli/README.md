# Lucid Agents CLI 🚀

**Command Line Interface yang powerful untuk membuat, mengelola, dan deploy Lucid Agents dengan mudah.**

Lucid Agents CLI menyediakan sistem lengkap untuk membuat, mengelola, dan men-deploy berbagai jenis AI agents dengan template yang sudah dioptimalkan dan dukungan multi-platform deployment.

## ✨ Fitur Utama

- **🏗️ Scaffolding Otomatis**: Buat agent dengan template yang sudah dioptimalkan
- **🎯 Multi-Platform Deploy**: Support deploy ke local, Docker, Cloud, dan Serverless
- **💬 Interactive Prompts**: Mode interaktif yang user-friendly
- **🔧 Customizable**: Konfigurasi yang fleksibel untuk berbagai kebutuhan
- **📚 Template Rich**: Berbagai jenis agent template (macro, arbitrage, game, creative, e-commerce)
- **🛠️ Development Ready**: Setup otomatis untuk testing, logging, dan monitoring
- **📋 Manifest Generation**: Auto-generate manifest ERC-8004 untuk agent

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g lucid-agents-cli
```

### Local Installation

```bash
npm install
npm link
```

## 🛠️ Usage

### Basic Commands

#### Buat Agent Baru

```bash
# Mode interaktif (direkomendasikan)
lucid-agent create

# Dengan opsi
lucid-agent create my-agent --type macro --typescript

# Non-interaktif
lucid-agent create --name crypto-bot --type arbitrage --directory ./agents
```

#### List Template

```bash
# Lihat semua template
lucid-agent list-templates

# Filter berdasarkan tipe
lucid-agent list-templates --type macro
```

#### Deploy Agent

```bash
# Mode interaktif
lucid-agent deploy

# Deploy ke environment tertentu
lucid-agent deploy --agent ./agents/my-agent --env prod

# Deploy ke platform tertentu
lucid-agent deploy --agent ./agents/my-agent --target docker
```

#### Inisialisasi Project

```bash
# Setup project baru
lucid-agent init

# Dengan TypeScript
lucid-agent init --typescript --directory ./my-agents
```

#### List Agents

```bash
# List semua agent
lucid-agent list

# List dari direktori tertentu
lucid-agent list --directory ./agents
```

### Legacy Manifest Commands (Still Available)

```bash
# Generate manifest dari konfigurasi
lucid-manifest generate --config agent-config.json

# Auto-generate dari proyek
lucid-manifest generate --auto --project-path ./my-agent-project

# Validate manifest
lucid-manifest validate manifest.json

# Info manifest
lucid-manifest info manifest.json

# Init template
lucid-manifest init --name "My AI Agent" --description "A helpful AI agent"
```

### Programmatic Usage

```javascript
const { ERC8004ManifestGenerator } = require('./lib/manifest');

// Inisialisasi generator
const generator = new ERC8004ManifestGenerator({
  network: 'eip155:1',
  registryAddress: '0x...',
  trustModels: ['reputation', 'tee-attestation']
});

// Generate manifest
const manifest = await generator.generateManifest(agentConfig);

// Save manifest
await generator.saveManifest(manifest, 'manifest.json');
```

## 🎯 Agent Types

### 1. Macro Agent 🔄
Agent untuk automasi tugas-tugas berulang dan kompleks.

**Use Cases:**
- Automated report generation
- Data backup and synchronization
- Email marketing campaigns
- System maintenance tasks

**Key Features:**
- Task scheduling and automation
- Multi-step workflow processing
- Error handling and retry logic
- State persistence

### 2. Arbitrage Agent 💹
Agent untuk mengidentifikasi dan memanfaatkan peluang arbitrase.

**Use Cases:**
- Cryptocurrency trading opportunities
- Currency exchange rate arbitrage
- Stock price differences across markets
- Sports betting opportunities

**Key Features:**
- Real-time market data analysis
- Multi-exchange monitoring
- Profit opportunity detection
- Risk assessment algorithms

### 3. Game Agent 🎮
Agent untuk interaksi dengan game dan strategi otomatis.

**Use Cases:**
- Gaming performance optimization
- Automated farming and grinding
- Strategy testing and refinement
- Multi-character management

**Key Features:**
- Game state monitoring
- Strategy optimization
- Performance analytics
- Anti-detection mechanisms

### 4. Creative Agent 🎨
Agent untuk pembuatan konten kreatif dan artistik.

**Use Cases:**
- Social media content creation
- Blog post and article writing
- Image and video generation
- Brand story development

**Key Features:**
- Content generation algorithms
- Style transfer capabilities
- Multi-format output support
- Creative prompt optimization

### 5. E-commerce Agent 🛒
Agent untuk optimasi dan manajemen toko online.

**Use Cases:**
- Dynamic pricing optimization
- Inventory forecasting and management
- Customer behavior analysis
- Automated customer support

**Key Features:**
- Product catalog management
- Order processing automation
- Price optimization algorithms
- Customer service integration

## ⚙️ Configuration Options

### Bahasa Pemrograman

- **JavaScript**: Default, untuk development yang cepat
- **TypeScript**: Untuk type safety dan better IDE support

### Fitur Tambahan

- **API Integration**: Integrasi dengan API eksternal
- **Database Integration**: Koneksi ke database (PostgreSQL, MongoDB)
- **Authentication**: Sistem otentikasi (JWT, OAuth)
- **Logging System**: Sistem logging terstruktur
- **Testing Setup**: Setup testing otomatis dengan Jest

## 📁 Project Structure

Setelah create, struktur project akan terlihat seperti ini:

```
my-agent/
├── src/
│   ├── agents/
│   │   ├── agent.js          # Main agent file
│   │   └── agent.ts          # TypeScript version (if applicable)
│   ├── config/
│   │   ├── config.js         # Configuration
│   │   └── config.ts         # TypeScript version
│   └── utils/
│       └── helpers.js
├── tests/
│   ├── agent.test.js
│   └── config.test.js
├── docs/
│   └── README.md
├── examples/
│   └── basic-usage.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── scripts/
    ├── start.sh              # Startup script
    ├── start-dev.sh          # Development mode
    ├── stop.sh               # Stop script
    └── logs.sh               # View logs
```

## 🚀 Deployment Options

### 1. Local Development 💻

```bash
# Start agent
npm start

# Development mode dengan auto-reload
npm run start:dev

# View logs
./scripts/logs.sh

# Stop agent
./scripts/stop.sh
```

### 2. Docker Container 🐳

```bash
# Build dan start container
docker-compose up -d

# View logs
docker-compose logs

# Stop containers
docker-compose down
```

### 3. Cloud Platform ☁️

Support untuk AWS, Google Cloud, dan Azure:

```bash
# Deploy ke AWS Lambda
./deploy-cloud.sh

# Dengan konfigurasi khusus
lucid-agent deploy --agent ./my-agent --env prod --target cloud
```

### 4. Serverless Functions ⚡

```bash
# Deploy sebagai serverless function
npm run deploy:serverless

# Test invoke
npm run invoke:serverless

# View logs
npm run logs:serverless
```

## ⚙️ Environment Configuration

Copy `.env.example` ke `.env` dan konfigurasi:

```env
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
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Linting

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Building (TypeScript only)

```bash
# Build untuk production
npm run build
```

## 🔧 Advanced Configuration

### Custom Agent Logic

Extend agent class untuk custom behavior:

```javascript
// src/agents/agent.js
class MyCustomAgent extends LucidAgent {
  constructor(config) {
    super({
      ...config,
      agentName: 'my-custom-agent',
      agentType: 'macro'
    });
  }
  
  async processCustomTasks() {
    // Implement your custom logic here
    console.log('Processing custom tasks...');
  }
}
```

### Plugin System

Buat plugins untuk extiende functionality:

```javascript
// src/plugins/custom-plugin.js
class CustomPlugin {
  constructor(agent) {
    this.agent = agent;
  }
  
  async initialize() {
    // Plugin initialization
  }
  
  async process(data) {
    // Plugin logic
    return processedData;
  }
}
```

## 📊 Monitoring & Debugging

### Logging

Agent menggunakan sistem logging terstruktur:

```javascript
// Log levels
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message');
```

### Health Checks

Built-in health check endpoint:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "agent": "my-agent",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Metrics

Agent mengumpulkan metrics:

- Execution time
- Memory usage
- Task processing rate
- Error rate
- Success rate

## 🆘 Troubleshooting

### Common Issues

1. **Dependencies tidak terinstall**
   ```bash
   npm install
   ```

2. **Port sudah digunakan**
   ```bash
   # Ubah port di config
   # atau stop proses lain yang menggunakan port
   ```

3. **Environment variables tidak terbaca**
   ```bash
   # Pastikan file .env ada dan sudah disource
   cp .env.example .env
   ```

4. **Agent tidak start**
   ```bash
   # Check logs
   ./scripts/logs.sh
   
   # Check configuration
   npm run lint
   ```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Or set in .env
echo "LOG_LEVEL=debug" >> .env
```

## 🤝 Contributing

Kami welcome kontribusi! Silakan lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines.

## 📝 Changelog

Lihat [CHANGELOG.md](CHANGELOG.md) untuk history perubahan.

## 📜 License

MIT License - lihat [LICENSE](LICENSE) untuk details.

## 📧 Support

- 📖 **Documentation**: https://docs.lucid-agents.com
- 💬 **Community**: https://discord.gg/lucid-agents
- 🐛 **Issues**: https://github.com/lucid-agents/cli/issues
- 📧 **Email**: support@lucid-agents.com

## 🏆 Examples

Contoh penggunaan berbagai agent type:

- [Macro Agent Example](examples/macro-agent/)
- [Arbitrage Agent Example](examples/arbitrage-agent/)
- [Game Agent Example](examples/game-agent/)
- [Creative Agent Example](examples/creative-agent/)
- [E-commerce Agent Example](examples/ecommerce-agent/)

---

**Made with ❤️ by the Lucid Agents Team**