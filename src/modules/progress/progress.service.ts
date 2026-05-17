import { Client } from '../../models/Client';
import {
  ProgressRecord, WeightHistory, WeeklyCheckIn,
} from '../../models/Progress';
import { AppError } from '../../shared/middleware/errorHandler';
import { Types } from 'mongoose';

export async function addProgressRecord(clientId: string, trainerId: string, data: any) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);

  if (data.weightKg) {
    await WeightHistory.create({ clientId: client._id, weightKg: data.weightKg });
    await Client.findByIdAndUpdate(client._id, { weightKg: data.weightKg });
  }

  return ProgressRecord.create({ clientId: client._id, ...data });
}

export async function getProgressHistory(clientId: string, trainerId: string) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);
  return ProgressRecord.find({ clientId: client._id })
    .sort({ recordedAt: -1 })
    .lean();
}

export async function getWeightHistory(clientId: string, trainerId: string) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);
  return WeightHistory.find({ clientId: client._id })
    .sort({ recordedAt: 1 })
    .lean();
}

export async function addCheckIn(clientId: string, trainerId: string, data: any) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);

  const now = new Date();
  const weekNumber = getWeekNumber(now);
  return WeeklyCheckIn.create({
    clientId: client._id,
    weekNumber,
    year: now.getFullYear(),
    ...data,
  });
}

export async function getCheckIns(clientId: string, trainerId: string) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);
  return WeeklyCheckIn.find({ clientId: client._id })
    .sort({ createdAt: -1 })
    .lean();
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
