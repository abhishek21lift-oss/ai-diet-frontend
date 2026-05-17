// progress.service.ts
import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';

export async function addProgressRecord(clientId: string, trainerId: string, data: any) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);

  // Also log to weight history
  if (data.weightKg) {
    await prisma.weightHistory.create({ data: { clientId, weightKg: data.weightKg } });
    await prisma.client.update({ where: { id: clientId }, data: { weightKg: data.weightKg } });
  }

  return prisma.progressRecord.create({ data: { clientId, ...data } });
}

export async function getProgressHistory(clientId: string, trainerId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);
  return prisma.progressRecord.findMany({
    where: { clientId },
    orderBy: { recordedAt: 'desc' },
  });
}

export async function getWeightHistory(clientId: string, trainerId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);
  return prisma.weightHistory.findMany({
    where: { clientId },
    orderBy: { recordedAt: 'asc' },
  });
}

export async function addCheckIn(clientId: string, trainerId: string, data: any) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);

  const now = new Date();
  const weekNumber = getWeekNumber(now);
  return prisma.weeklyCheckIn.create({
    data: { clientId, weekNumber, year: now.getFullYear(), ...data },
  });
}

export async function getCheckIns(clientId: string, trainerId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);
  return prisma.weeklyCheckIn.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
