# Game Automation Agent

Agent canggih untuk automasi game, testing performa, dan monitoring game development. Agent ini dapat melakukan automated playtesting, performance monitoring, dan bug detection.

## 🎮 Fitur Utama

- **Game Automation**: Kontrol otomatis untuk game testing
- **Performance Monitoring**: Tracking FPS, memory, dan CPU usage
- **Automated Playtesting**: Testing otomatis untuk game QA
- **Bug Detection**: Deteksi error dan bug dalam game
- **Screenshot Capture**: Screenshot berkala untuk monitoring visual
- **Regression Testing**: Testing untuk memastikan tidak ada regresi

## 🚀 Instalasi

```bash
npm install
cp .env.example .env
npm run build
npm start
```

## 📋 Konfigurasi

Edit `src/index.ts` untuk menyesuaikan konfigurasi:

```typescript
const config: GameAgentConfig = {
  games: {
    targetGames: ['game1', 'game2'],
    automationMode: 'testing'
  },
  automation: {
    screenshotInterval: 5000,
    actionDelay: 200
  }
};
```

## 🎯 Penggunaan

### Memulai Game Session

```typescript
const sessionId = await agent.startGameSession('my-game');
```

### Melakukan Action

```typescript
await agent.performAction(sessionId, {
  type: 'click',
  x: 100,
  y: 200,
  duration: 100
});
```

## 📊 Metrics

Agent mengumpulkan metrics berikut:
- FPS tracking
- Memory usage
- CPU utilization
- Error count
- Performance score

## 🔧 API Reference

- `startGameSession(gameId)` - Memulai session game
- `performAction(sessionId, action)` - Menjalankan action
- `getMetrics(sessionId)` - Mendapatkan metrics session
- `stopSession(sessionId)` - Menghentikan session

## 🐳 Deployment

```bash
# Docker
docker build -t game-agent .
docker run -d -p 3000:3000 game-agent

# Manual
npm run deploy
```

## 📄 License

MIT License