import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerTrainer(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 400);
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result, 'Tokens refreshed');
  } catch (err) { next(err); }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logoutUser(req.user!.id);
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, req.user, 'Current user');
  } catch (err) { next(err); }
}
