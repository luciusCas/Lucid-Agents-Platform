# Macro Automation Agent

Agent canggih untuk mengotomatisasi tugas-tugas berulang dan alur kerja kompleks. Agent ini dapat mengeksekusi tugas-tugas web automation, API integration, workflow orchestration, dan data processing dengan kemampuan retry dan error handling yang robust.

## 🚀 Fitur Utama

- **Web Automation**: Automasi browser untuk scraping, testing, dan interaksi web
- **API Integration**: Integrasi dengan REST APIs dengan authentication dan rate limiting
- **Workflow Orchestration**: Orkestrasi workflow kompleks dengan sequential dan parallel execution
- **Data Processing**: Pemrosesan dan transformasi data dari berbagai format
- **Scheduling**: Penjadwalan tugas dengan cron expressions
- **File Operations**: Operasi file dan direktori yang lengkap
- **Notification System**: Notifikasi melalui email, webhook, dan platform messaging

## 📋 Persyaratan

- Node.js 18.0.0 atau lebih tinggi
- npm atau yarn
- 512MB RAM minimum
- 1 CPU core
- Akses internet untuk web automation

## 🛠 Instalasi

1. Clone atau download template ini
2. Install dependencies:

```bash
npm install
```

3. Konfigurasi environment variables:

```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. Build project:

```bash
npm run build
```

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```bash
# Environment
NODE_ENV=production
LOG_LEVEL=info
MAX_CONCURRENT_TASKS=5
TIMEOUT=300000

# Browser Configuration
BROWSER_PATH=/usr/bin/chromium

# API Keys (optional)
API_KEYS=your_api_keys_here
```

### Konfigurasi Agent

Edit `src/index.ts` untuk menyesuaikan konfigurasi:

```typescript
const config: MacroAgentConfig = {
  name: 'macro-agent',
  version: '1.0.0',
  description: 'Agent untuk mengotomatisasi tugas-tugas berulang',
  maxConcurrentTasks: 5,
  retryAttempts: 3,
  timeout: 300000,
  logging: {
    level: 'info',
    file: 'logs/macro-agent.log'
  }
};
```

## 📝 Penggunaan

### Menjalankan Agent

```bash
# Development mode
npm run dev

# Production mode
npm start

# Dengan monitoring
npm run start:monitor
```

### Contoh Tugas

#### 1. Web Automation

```typescript
const webTask: Task = {
  name: 'scrape-news',
  type: 'web-automation',
  config: {
    url: 'https://news.example.com',
    actions: [
      { type: 'wait', selector: '.news-list' },
      { type: 'screenshot', path: 'news-screenshot.png' },
      { type: 'click', selector: '.load-more' }
    ],
    waitTime: 2000
  }
};
```

#### 2. API Call

```typescript
const apiTask: Task = {
  name: 'check-api-status',
  type: 'api-call',
  config: {
    method: 'GET',
    url: 'https://api.example.com/health',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json'
    }
  }
};
```

#### 3. Workflow

```typescript
const workflowTask: Task = {
  name: 'data-pipeline',
  type: 'workflow',
  config: {
    steps: [
      {
        name: 'load-data',
        type: 'file-operation',
        config: { action: 'read', path: 'data.csv' }
      },
      {
        name: 'process-data',
        type: 'data-processing',
        config: { 
          processor: 'transform',
          transform: { type: 'csv-to-json' }
        }
      },
      {
        name: 'save-result',
        type: 'file-operation',
        config: { action: 'write', path: 'result.json' }
      }
    ]
  }
};
```

#### 4. Data Processing

```typescript
const dataTask: Task = {
  name: 'process-csv',
  type: 'data-processing',
  config: {
    source: {
      type: 'file',
      config: { path: 'input.csv' }
    },
    processor: {
      type: 'transform',
      config: { 
        operations: [
          { type: 'filter', condition: 'age > 18' },
          { type: 'aggregate', groupBy: 'category' }
        ]
      }
    },
    destination: {
      type: 'file',
      config: { path: 'output.json', format: 'json' }
    }
  }
};
```

## 🕒 Penjadwalan

Agent mendukung penjadwalan tugas menggunakan cron expressions:

```typescript
import cron from 'node-cron';

// Jalankan setiap jam
cron.schedule('0 * * * *', () => {
  const scheduledTask: Task = {
    name: 'hourly-check',
    type: 'api-call',
    config: {
      method: 'GET',
      url: 'https://api.example.com/status'
    }
  };
  
  agent.addToQueue(scheduledTask);
});
```

## 📊 Monitoring dan Logging

### Log Level

- `debug`: Informasi detail untuk debugging
- `info`: Informasi umum tentang operasi
- `warn`: Peringatan tentang masalah potensial
- `error`: Error yang memerlukan perhatian

### Metrics

Agent mengumpulkan metrics berikut:

- Total tasks executed
- Success/failure rate
- Average execution time
- Memory usage
- Task queue size

```typescript
// Mendapatkan metrics
const metrics = await agent.getMetrics();
console.log('Total tasks:', metrics.totalTasks);
console.log('Success rate:', metrics.completedTasks / metrics.totalTasks);
```

## 🔧 API Reference

### Kelas Agent

#### Constructor

```typescript
constructor(config: MacroAgentConfig)
```

#### Methods

- `initialize(): Promise<void>` - Inisialisasi agent
- `start(): Promise<void>` - Memulai agent
- `stop(): Promise<void>` - Menghentikan agent
- `executeTask(task: Task): Promise<TaskResult>` - Menjalankan task
- `addToQueue(task: Task): void` - Menambah task ke queue

#### Events

- `started` - Agent mulai berjalan
- `stopped` - Agent berhenti
- `taskQueued` - Task ditambahkan ke queue
- `taskCompleted` - Task selesai
- `taskFailed` - Task gagal

## 🚀 Deployment

### Manual Deployment

```bash
# Build project
npm run build

# Deploy ke server
./scripts/deploy.sh

# Verifikasi deployment
curl http://localhost:3000/health
```

### Docker Deployment

```bash
# Build image
docker build -t macro-agent .

# Jalankan container
docker run -d \
  --name macro-agent \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/data:/app/data \
  macro-agent
```

### Cloud Deployment

Agent dapat di-deploy ke berbagai platform cloud:

- AWS Lambda
- Google Cloud Functions
- Azure Functions
- Railway
- Vercel
- DigitalOcean App Platform

## 🧪 Testing

```bash
# Jalankan tests
npm test

# Tests dengan coverage
npm run test:coverage

# Tests dalam watch mode
npm run test:watch
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 🆘 Support

Jika Anda mengalami masalah:

1. Baca dokumentasi ini dengan teliti
2. Periksa [Issues](../../issues) yang sudah ada
3. Buat issue baru dengan:
   - Deskripsi masalah
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## 🔗 Links

- [Documentation](../docs/)
- [API Reference](../docs/api.md)
- [Examples](../examples/)
- [Changelog](../CHANGELOG.md)

---

**Catatan**: Agent ini dirancang untuk tugas-tugas yang legal dan etis. Pastikan Anda memiliki izin yang diperlukan sebelum mengotomatisasi akses ke website atau API pihak ketiga.