import { Agent } from './agent.js';
import { MacroAgentConfig } from './types.js';

const config: MacroAgentConfig = {
  name: 'macro-agent',
  version: '1.0.0',
  description: 'Agent untuk mengotomatisasi tugas-tugas berulang dan alur kerja kompleks',
  maxConcurrentTasks: 5,
  retryAttempts: 3,
  timeout: 300000, // 5 minutes
  logging: {
    level: 'info',
    file: 'logs/macro-agent.log'
  }
};

async function main() {
  try {
    const agent = new Agent(config);
    await agent.initialize();
    await agent.start();
    
    console.log('🚀 Macro Agent started successfully');
  } catch (error) {
    console.error('❌ Failed to start Macro Agent:', error);
    process.exit(1);
  }
}

main();