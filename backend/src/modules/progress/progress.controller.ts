import { Response, NextFunction } from 'express';
import * as progressService from './progress.service';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AppError } from '../../shared/middleware/errorHandler';
import { AuthRequest } from '../../shared/types';

export async function addProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const record = await progressService.addProgressRecord(req.params.clientId, trainerId, req.body);
    sendSuccess(res, record, 'Progress recorded', 201);
  } catch (err) { next(err); }
}

export async function getProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const records = await progressService.getProgressHistory(req.params.clientId, trainerId);
    sendSuccess(res, records, 'Progress history fetched');
  } catch (err) { next(err); }
}

export async function getWeightHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const history = await progressService.getWeightHistory(req.params.clientId, trainerId);
    sendSuccess(res, history, 'Weight history fetched');
  } catch (err) { next(err); }
}

export async function addCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const checkIn = await progressService.addCheckIn(req.params.clientId, trainerId, req.body);
    sendSuccess(res, checkIn, 'Check-in saved', 201);
  } catch (err) { next(err); }
}

export async function getCheckIns(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const checkIns = await progressService.getCheckIns(req.params.clientId, trainerId);
    sendSuccess(res, checkIns, 'Check-ins fetched');
  } catch (err) { next(err); }
}
