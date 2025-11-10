import { EventEmitter } from 'events';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { MacroAgentConfig, Task, TaskResult, WorkflowStep } from './types.js';
import { Logger } from './utils.js';

export class Agent extends EventEmitter {
  private config: MacroAgentConfig;
  private logger: Logger;
  private isRunning = false;
  private browser: puppeteer.Browser | null = null;
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, Task> = new Map();

  constructor(config: MacroAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger(config.logging);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Macro Agent...');
    
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Setup event handlers
    this.setupEventHandlers();

    this.logger.info('Macro Agent initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('Starting Macro Agent...');

    // Start task processor
    this.processTaskQueue();

    // Emit started event
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.logger.info('Stopping Macro Agent...');

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    // Cancel active tasks
    this.activeTasks.forEach((task) => {
      task.status = 'cancelled';
    });

    this.emit('stopped');
    this.logger.info('Macro Agent stopped');
  }

  async executeTask(task: Task): Promise<TaskResult> {
    const taskId = this.generateTaskId();
    const taskWithId = { ...task, id: taskId, status: 'running' as const };

    this.activeTasks.set(taskId, taskWithId);
    this.logger.info(`Executing task: ${task.name} (${taskId})`);

    try {
      const result = await this.processTask(taskWithId);
      taskWithId.status = 'completed';
      
      this.logger.info(`Task completed: ${task.name} (${taskId})`);
      this.emit('taskCompleted', result);
      
      return result;
    } catch (error) {
      taskWithId.status = 'failed';
      const taskResult: TaskResult = {
        taskId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };

      this.logger.error(`Task failed: ${task.name} (${taskId})`, error);
      this.emit('taskFailed', taskResult);
      
      return taskResult;
    } finally {
      this.activeTasks.delete(taskId);
    }
  }

  addToQueue(task: Task): void {
    this.taskQueue.push(task);
    this.logger.info(`Task added to queue: ${task.name}`);
    this.emit('taskQueued', task);
  }

  private async processTaskQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.taskQueue.length === 0 || this.activeTasks.size >= this.config.maxConcurrentTasks) {
        await this.sleep(1000);
        continue;
      }

      const task = this.taskQueue.shift()!;
      this.executeTask(task).catch(error => {
        this.logger.error('Error processing task:', error);
      });
    }
  }

  private async processTask(task: Task): Promise<TaskResult> {
    switch (task.type) {
      case 'web-automation':
        return this.executeWebAutomation(task);
      case 'api-call':
        return this.executeApiCall(task);
      case 'workflow':
        return this.executeWorkflow(task);
      case 'data-processing':
        return this.executeDataProcessing(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async executeWebAutomation(task: Task): Promise<TaskResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    try {
      const { url, actions, waitTime } = task.config as any;
      
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      if (waitTime) {
        await this.sleep(waitTime);
      }

      if (actions) {
        for (const action of actions) {
          await this.executePageAction(page, action);
        }
      }

      const content = await page.content();
      
      return {
        taskId: task.id!,
        success: true,
        data: { content, url }
      };
    } finally {
      await page.close();
    }
  }

  private async executePageAction(page: puppeteer.Page, action: any): Promise<void> {
    switch (action.type) {
      case 'click':
        await page.click(action.selector);
        break;
      case 'type':
        await page.type(action.selector, action.text);
        break;
      case 'wait':
        await page.waitForSelector(action.selector, { timeout: action.timeout || 10000 });
        break;
      case 'screenshot':
        await page.screenshot({ path: action.path });
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeApiCall(task: Task): Promise<TaskResult> {
    const { method, url, headers, data } = task.config as any;
    
    const response = await axios({
      method,
      url,
      headers,
      data,
      timeout: this.config.timeout
    });

    return {
      taskId: task.id!,
      success: true,
      data: response.data
    };
  }

  private async executeWorkflow(task: Task): Promise<TaskResult> {
    const { steps } = task.config as { steps: WorkflowStep[] };
    const results: any[] = [];

    for (const step of steps) {
      const stepTask: Task = {
        name: step.name,
        type: step.type,
        config: step.config
      };
      
      const result = await this.executeTask(stepTask);
      
      if (!result.success) {
        throw new Error(`Workflow step failed: ${step.name}`);
      }
      
      results.push(result.data);
    }

    return {
      taskId: task.id!,
      success: true,
      data: results
    };
  }

  private async executeDataProcessing(task: Task): Promise<TaskResult> {
    const { source, processor, destination } = task.config as any;
    
    // Simulate data processing
    const data = await this.loadData(source);
    const processedData = await this.processData(data, processor);
    
    if (destination) {
      await this.saveData(processedData, destination);
    }

    return {
      taskId: task.id!,
      success: true,
      data: processedData
    };
  }

  private async loadData(source: any): Promise<any> {
    // Implementation for data loading
    return { data: 'sample data' };
  }

  private async processData(data: any, processor: any): Promise<any> {
    // Implementation for data processing
    return { processed: true, original: data };
  }

  private async saveData(data: any, destination: any): Promise<void> {
    // Implementation for data saving
    console.log('Saving data to:', destination);
  }

  private setupEventHandlers(): void {
    this.on('taskCompleted', (result: TaskResult) => {
      this.logger.info(`Task completed: ${result.taskId}`);
    });

    this.on('taskFailed', (result: TaskResult) => {
      this.logger.error(`Task failed: ${result.taskId} - ${result.error}`);
    });
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}