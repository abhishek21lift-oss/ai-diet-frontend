import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { verifyAccessToken } from '../utils/jwtHelper';
import { AppError } from './errorHandler';
import { AuthRequest } from '../types';

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) throw new AppError('Unauthorized', 401);

    // Get trainerId if trainer
    let trainerId: string | undefined;
    if (user.role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({ where: { userId: user.id } });
      trainerId = trainer?.id;
    }

    req.user = { id: user.id, role: user.role, trainerId };
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
}
