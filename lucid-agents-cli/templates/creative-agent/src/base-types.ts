// Base types used across agent templates

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  file?: string;
}

export interface EnvironmentVariables {
  NODE_ENV?: 'development' | 'production' | 'test';
  LOG_LEVEL?: string;
  API_KEYS?: string;
}

export interface BaseAgentConfig {
  name: string;
  version: string;
  description: string;
  logging: LoggingConfig;
}