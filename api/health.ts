import { Request, Response } from 'express';
import { apiHandler, corsMiddleware } from './_middleware';
import { database } from '../src/lib/backend/config/database';

async function handler(req: Request, res: Response) {
  corsMiddleware(req, res, () => {});
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  
  // Check database
  let dbStatus = 'healthy';
  try {
    await database.get('SELECT 1');
  } catch (error) {
    dbStatus = 'unhealthy';
  }
  
  const responseTime = Date.now() - startTime;
  
  const health = {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbStatus,
        responseTime: `${responseTime}ms`
      }
    }
  };

  const statusCode = dbStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    success: dbStatus === 'healthy',
    health
  });
}

export default apiHandler(handler);
