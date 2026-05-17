import { Response, NextFunction } from 'express';
import * as clientService from './client.service';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { AppError } from '../../shared/middleware/errorHandler';
import { AuthRequest } from '../../shared/types';

export async function createClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const client = await clientService.createClient(trainerId, req.body);
    sendSuccess(res, client, 'Client created', 201);
  } catch (err) { next(err); }
}

export async function getClients(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const { page, limit, search, goal, bodyType } = req.query;
    const result = await clientService.getClients(trainerId, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: String(search || ''),
      goal: String(goal || ''),
      bodyType: String(bodyType || ''),
    });
    sendSuccess(res, result.clients, 'Clients fetched', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) { next(err); }
}

export async function getClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const client = await clientService.getClientById(req.params.id, trainerId);
    sendSuccess(res, client, 'Client fetched');
  } catch (err) { next(err); }
}

export async function updateClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const client = await clientService.updateClient(req.params.id, trainerId, req.body);
    sendSuccess(res, client, 'Client updated');
  } catch (err) { next(err); }
}

export async function deleteClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    await clientService.deleteClient(req.params.id, trainerId);
    sendSuccess(res, null, 'Client deleted');
  } catch (err) { next(err); }
}

export async function getClientMetrics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trainerId = req.user?.trainerId;
    if (!trainerId) throw new AppError('Trainer profile not found', 400);
    const metrics = await clientService.getClientMetrics(req.params.id, trainerId);
    sendSuccess(res, metrics, 'Metrics calculated');
  } catch (err) { next(err); }
}
