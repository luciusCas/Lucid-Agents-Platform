import { EventEmitter } from 'events';
import axios from 'axios';
import { CreativeAgentConfig, ContentRequest, ContentResult, CreativeProject } from './types.js';
import { Logger } from './utils.js';

export class Agent extends EventEmitter {
  private config: CreativeAgentConfig;
  private logger: Logger;
  private isRunning = false;
  private projects: Map<string, CreativeProject> = new Map();

  constructor(config: CreativeAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger(config.logging);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Creative Agent...');
    this.setupEventHandlers();
    this.logger.info('Creative Agent initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.info('Starting Creative Agent...');
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Creative Agent stopped');
    this.emit('stopped');
  }

  async generateContent(request: ContentRequest): Promise<ContentResult> {
    this.logger.info(`Generating ${request.type} content: ${request.prompt}`);

    try {
      let result: any;

      switch (request.type) {
        case 'text':
          result = await this.generateText(request);
          break;
        case 'image':
          result = await this.generateImage(request);
          break;
        case 'video':
          result = await this.generateVideo(request);
          break;
        case 'audio':
          result = await this.generateAudio(request);
          break;
        default:
          throw new Error(`Unsupported content type: ${request.type}`);
      }

      this.logger.info(`Content generated successfully`);
      this.emit('contentGenerated', result);
      return { success: true, content: result };
    } catch (error) {
      this.logger.error('Content generation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async generateText(request: ContentRequest): Promise<any> {
    if (!this.config.ai.openai.enabled) {
      throw new Error('OpenAI integration is not enabled');
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: this.config.ai.openai.model,
      messages: [
        { role: 'user', content: request.prompt }
      ],
      max_tokens: this.config.ai.openai.maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${this.config.ai.openai.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      type: 'text',
      content: response.data.choices[0].message.content,
      model: this.config.ai.openai.model,
      usage: response.data.usage
    };
  }

  private async generateImage(request: ContentRequest): Promise<any> {
    if (!this.config.ai.stability.enabled) {
      throw new Error('Stability AI integration is not enabled');
    }

    // Simulate image generation
    return {
      type: 'image',
      prompt: request.prompt,
      model: this.config.ai.stability.model,
      url: 'https://placeholder.com/512x512',
      metadata: {
        width: 512,
        height: 512,
        steps: 30
      }
    };
  }

  private async generateVideo(request: ContentRequest): Promise<any> {
    // Simulate video generation
    return {
      type: 'video',
      prompt: request.prompt,
      url: 'https://placeholder.com/video.mp4',
      duration: 10,
      resolution: '1080p'
    };
  }

  private async generateAudio(request: ContentRequest): Promise<any> {
    // Simulate audio generation
    return {
      type: 'audio',
      prompt: request.prompt,
      url: 'https://placeholder.com/audio.mp3',
      duration: 30,
      format: 'mp3'
    };
  }

  createProject(name: string, type: string): string {
    const id = `project_${Date.now()}`;
    const project: CreativeProject = {
      id,
      name,
      type,
      status: 'draft',
      createdAt: new Date(),
      files: [],
      settings: {}
    };

    this.projects.set(id, project);
    this.logger.info(`Project created: ${name} (${id})`);
    return id;
  }

  getProject(id: string): CreativeProject | undefined {
    return this.projects.get(id);
  }

  listProjects(): CreativeProject[] {
    return Array.from(this.projects.values());
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  private setupEventHandlers(): void {
    this.on('contentGenerated', (content) => {
      this.logger.info('New content generated');
    });
  }
}