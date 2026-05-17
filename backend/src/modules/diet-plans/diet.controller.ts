import { Response, NextFunction } from 'express';
import * as dietService from './diet.service';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AppError } from '../../shared/middleware/errorHandler';
import { AuthRequest } from '../../shared/types';

export async function generateDietPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const plan = await dietService.generateDietPlan(req.params.clientId, trainerId);
    sendSuccess(res, plan, 'AI diet plan generated', 201);
  } catch (err) { next(err); }
}

export async function getDietPlans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const plans = await dietService.getDietPlans(req.params.clientId, trainerId);
    sendSuccess(res, plans, 'Diet plans fetched');
  } catch (err) { next(err); }
}

export async function getDietPlan(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const plan = await dietService.getDietPlanById(req.params.planId, trainerId);
    sendSuccess(res, plan, 'Diet plan fetched');
  } catch (err) { next(err); }
}
