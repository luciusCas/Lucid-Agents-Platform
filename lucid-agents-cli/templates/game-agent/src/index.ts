import { Agent } from './agent.js';
import { GameAgentConfig } from './types.js';

const config: GameAgentConfig = {
  name: 'game-agent',
  version: '1.0.0',
  description: 'Agent untuk automasi game, testing, dan monitoring performa',
  games: {
    targetGames: [],
    automationMode: 'testing'
  },
  automation: {
    screenshotInterval: 5000,
    inputDelay: 100,
    actionDelay: 200,
    maxSessionTime: 3600000
  },
  monitoring: {
    fpsTracking: true,
    memoryMonitoring: true,
    errorDetection: true,
    performanceMetrics: true
  },
  testing: {
    automatedPlaytesting: true,
    bugReporting: true,
    regressionTesting: true,
    loadTesting: true
  },
  logging: {
    level: 'info',
    file: 'logs/game-agent.log'
  }
};

async function main() {
  try {
    const agent = new Agent(config);
    await agent.initialize();
    await agent.start();
    
    console.log('🎮 Game Agent started successfully');
  } catch (error) {
    console.error('❌ Failed to start Game Agent:', error);
    process.exit(1);
  }
}

main();