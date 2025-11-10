import { Request, Response, NextFunction } from 'express';
import { database } from '../src/lib/backend/config/database';

// Initialize database once
let dbInitialized = false;

export async function initDatabase() {
  if (!dbInitialized) {
    await database.init();
    dbInitialized = true;
  }
}

// Error handler wrapper
export function apiHandler(handler: Function) {
  return async (req: Request, res: Response) => {
    try {
      await initDatabase();
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', error);
      
      const statusCode = error.statusCode || 500;
      const code = error.code || 'INTERNAL_ERROR';
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Internal server error',
        code
      });
    }
  };
}

// CORS headers
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-Key'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}
