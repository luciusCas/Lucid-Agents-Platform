// Creative Agent Types
import { LoggingConfig } from './base-types.js';

export interface CreativeAgentConfig {
  name: string;
  version: string;
  description: string;
  ai: {
    openai: {
      enabled: boolean;
      apiKey: string;
      model: string;
      maxTokens: number;
    };
    stability: {
      enabled: boolean;
      apiKey: string;
      model: string;
    };
  };
  content: {
    types: string[];
    outputFormats: string[];
    quality: 'draft' | 'standard' | 'high';
  };
  automation: {
    batchProcessing: boolean;
    scheduledGeneration: boolean;
    autoPublish: boolean;
  };
  logging: LoggingConfig;
}

export interface ContentRequest {
  type: 'text' | 'image' | 'video' | 'audio';
  prompt: string;
  parameters?: any;
  outputPath?: string;
}

export interface ContentResult {
  success: boolean;
  content?: any;
  error?: string;
  metadata?: any;
}

export interface CreativeProject {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: Date;
  files: string[];
  settings: any;
}