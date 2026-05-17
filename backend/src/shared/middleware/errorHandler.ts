import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({ success: false, error: 'Record already exists (unique constraint)' });
    return;
  }
  if (err.code === 'P2025') {
    res.status(404).json({ success: false, error: 'Record not found' });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expired' });
    return;
  }

  // Generic
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}
