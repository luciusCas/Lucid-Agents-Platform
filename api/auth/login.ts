import { Request, Response } from 'express';
import { apiHandler, corsMiddleware } from '../_middleware';
import { authRoutes } from '../../src/lib/backend/routes/authRoutes';
import { asyncHandler } from '../../src/lib/backend/middleware/errorHandler';

async function handler(req: Request, res: Response) {
  corsMiddleware(req, res, () => {});
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await authRoutes.login(req, res);
}

export default apiHandler(handler);
