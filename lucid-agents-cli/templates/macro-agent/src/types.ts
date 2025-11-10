export interface MacroAgentConfig {
  name: string;
  version: string;
  description: string;
  maxConcurrentTasks: number;
  retryAttempts: number;
  timeout: number;
  logging: LoggingConfig;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  file?: string;
}

export interface Task {
  id?: string;
  name: string;
  type: TaskType;
  config: any;
  status?: TaskStatus;
  priority?: number;
  createdAt?: Date;
  retryCount?: number;
}

export type TaskType = 
  | 'web-automation'
  | 'api-call'
  | 'workflow'
  | 'data-processing'
  | 'file-operation'
  | 'email'
  | 'notification';

export type TaskStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying';

export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  timestamp: Date;
}

export interface WorkflowStep {
  name: string;
  type: TaskType;
  config: any;
  condition?: string;
  retryOnFailure?: boolean;
}

export interface WebAutomationConfig {
  url: string;
  actions: PageAction[];
  waitTime?: number;
  timeout?: number;
}

export interface PageAction {
  type: 'click' | 'type' | 'wait' | 'screenshot' | 'scroll' | 'select';
  selector?: string;
  text?: string;
  value?: string;
  path?: string;
  timeout?: number;
}

export interface ApiCallConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface DataProcessingConfig {
  source: DataSource;
  processor: DataProcessor;
  destination?: DataDestination;
}

export interface DataSource {
  type: 'file' | 'api' | 'database' | 'stream';
  config: any;
}

export interface DataProcessor {
  type: 'transform' | 'filter' | 'aggregate' | 'validate';
  config: any;
}

export interface DataDestination {
  type: 'file' | 'api' | 'database' | 'stream';
  config: any;
}

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
  from?: string;
}

export interface NotificationConfig {
  channel: 'webhook' | 'slack' | 'discord' | 'telegram';
  message: string;
  recipients?: string[];
  metadata?: Record<string, any>;
}

export interface CronSchedule {
  expression: string; // cron expression
  timezone?: string;
  enabled?: boolean;
}

export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  uptime: number;
  lastActivity: Date;
}

export interface EnvironmentVariables {
  NODE_ENV?: 'development' | 'production' | 'test';
  LOG_LEVEL?: string;
  MAX_CONCURRENT_TASKS?: string;
  TIMEOUT?: string;
  BROWSER_PATH?: string;
  API_KEYS?: string;
}