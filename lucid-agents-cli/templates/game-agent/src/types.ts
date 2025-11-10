// Game Agent Types
export interface GameAgentConfig {
  name: string;
  version: string;
  description: string;
  games: {
    targetGames: string[];
    automationMode: 'testing' | 'play' | 'performance';
  };
  automation: {
    screenshotInterval: number;
    inputDelay: number;
    actionDelay: number;
    maxSessionTime: number;
  };
  monitoring: {
    fpsTracking: boolean;
    memoryMonitoring: boolean;
    errorDetection: boolean;
    performanceMetrics: boolean;
  };
  testing: {
    automatedPlaytesting: boolean;
    bugReporting: boolean;
    regressionTesting: boolean;
    loadTesting: boolean;
  };
  logging: {
    level: string;
    file: string;
  };
}

export interface GameSession {
  id: string;
  gameId: string;
  startTime: Date;
  active: boolean;
  metrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  fps: number[];
  memory: number[];
  cpu: number[];
  errors: number[];
}