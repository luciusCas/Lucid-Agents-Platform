import { Agent } from './agent.js';
import { CreativeAgentConfig } from './types.js';

const config: CreativeAgentConfig = {
  name: 'creative-agent',
  version: '1.0.0',
  description: 'Agent AI untuk pembuatan konten kreatif dan generatif',
  ai: {
    openai: {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 4000
    },
    stability: {
      enabled: true,
      apiKey: process.env.STABILITY_API_KEY || '',
      model: 'sd-xl'
    }
  },
  content: {
    types: ['text', 'image', 'video', 'audio'],
    outputFormats: ['json', 'base64', 'file'],
    quality: 'standard'
  },
  automation: {
    batchProcessing: true,
    scheduledGeneration: false,
    autoPublish: false
  },
  logging: {
    level: 'info',
    file: 'logs/creative-agent.log'
  }
};

async function main() {
  try {
    const agent = new Agent(config);
    await agent.initialize();
    await agent.start();
    
    console.log('🎨 Creative Agent started successfully');
  } catch (error) {
    console.error('❌ Failed to start Creative Agent:', error);
    process.exit(1);
  }
}

main();