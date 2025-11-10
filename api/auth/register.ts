import { Request, Response } from 'express';
import { apiHandler, corsMiddleware } from '../_middleware';
import { authRoutes } from '../../src/lib/backend/routes/authRoutes';

async function handler(req: Request, res: Response) {
  corsMiddleware(req, res, () => {});
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authRoutes.register(req, res);
}

export default apiHandler(handler);
