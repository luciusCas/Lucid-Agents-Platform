import { EventEmitter } from 'events';
import axios from 'axios';
import { GameAgentConfig, GameSession, PerformanceMetrics } from './types.js';
import { Logger } from './utils.js';

export class Agent extends EventEmitter {
  private config: GameAgentConfig;
  private logger: Logger;
  private isRunning = false;
  private activeSessions: Map<string, GameSession> = new Map();

  constructor(config: GameAgentConfig) {
    super();
    this.config = config;
    this.logger = new Logger(config.logging);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Game Agent...');
    this.setupEventHandlers();
    this.logger.info('Game Agent initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.info('Starting Game Agent...');
    this.emit('started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.activeSessions.forEach(session => session.active = false);
    this.logger.info('Game Agent stopped');
    this.emit('stopped');
  }

  async startGameSession(gameId: string): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: GameSession = {
      id: sessionId,
      gameId,
      startTime: new Date(),
      active: true,
      metrics: {
        fps: [],
        memory: [],
        errors: []
      }
    };

    this.activeSessions.set(sessionId, session);
    this.logger.info(`Game session started: ${sessionId} for game ${gameId}`);
    return sessionId;
  }

  async performAction(sessionId: string, action: any): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Simulate game action execution
    this.logger.debug(`Performing action in session ${sessionId}: ${action.type}`);
    
    // Track performance metrics
    this.trackMetrics(session);
  }

  private trackMetrics(session: GameSession): void {
    // Simulate metrics collection
    const metrics: PerformanceMetrics = {
      fps: Math.random() * 60 + 30,
      memory: Math.random() * 1000 + 500,
      cpu: Math.random() * 100,
      errors: Math.floor(Math.random() * 5)
    };

    session.metrics.fps.push(metrics.fps);
    session.metrics.memory.push(metrics.memory);
    session.metrics.errors.push(metrics.errors);
  }

  private setupEventHandlers(): void {
    this.on('gameStarted', (sessionId: string) => {
      this.logger.info(`Game started in session: ${sessionId}`);
    });
  }
}