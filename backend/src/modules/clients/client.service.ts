import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { computeAllMetrics, calculateAge } from '../../shared/utils/calculations';

export async function createClient(trainerId: string, data: any) {
  const age = calculateAge(new Date(data.dateOfBirth));
  const metrics = computeAllMetrics(
    data.weightKg, data.heightCm, age,
    data.gender, data.activityLevel, data.fitnessGoal
  );

  return prisma.client.create({
    data: {
      ...data,
      trainerId,
      age,
      dateOfBirth: new Date(data.dateOfBirth),
      ...metrics,
    },
  });
}

export async function getClients(
  trainerId: string,
  { page = 1, limit = 20, search = '', goal = '', bodyType = '' }: any
) {
  const skip = (page - 1) * limit;
  const where: any = { trainerId, isActive: true };

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search } },
    ];
  }
  if (goal) where.fitnessGoal = goal;
  if (bodyType) where.bodyType = bodyType;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, fullName: true, email: true, mobile: true,
        gender: true, age: true, weightKg: true, heightCm: true,
        fitnessGoal: true, bodyType: true, dietType: true,
        bmi: true, dailyCalories: true, isActive: true, createdAt: true,
        _count: { select: { dietPlans: true, progressRecords: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return { clients, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getClientById(id: string, trainerId: string) {
  const client = await prisma.client.findFirst({
    where: { id, trainerId, isActive: true },
    include: {
      dietPlans: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { meals: { include: { foods: true } } },
      },
      _count: {
        select: { progressRecords: true, checkIns: true, progressPhotos: true },
      },
    },
  });
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

export async function updateClient(id: string, trainerId: string, data: any) {
  const existing = await prisma.client.findFirst({ where: { id, trainerId } });
  if (!existing) throw new AppError('Client not found', 404);

  // Recalculate metrics if body/goal data changes
  const weightKg = data.weightKg ?? existing.weightKg;
  const heightCm = data.heightCm ?? existing.heightCm;
  const age = data.dateOfBirth
    ? calculateAge(new Date(data.dateOfBirth))
    : existing.age;
  const gender = data.gender ?? existing.gender;
  const activityLevel = data.activityLevel ?? existing.activityLevel;
  const fitnessGoal = data.fitnessGoal ?? existing.fitnessGoal;

  const metrics = computeAllMetrics(weightKg, heightCm, age, gender, activityLevel, fitnessGoal);

  return prisma.client.update({
    where: { id },
    data: { ...data, age, ...metrics },
  });
}

export async function deleteClient(id: string, trainerId: string) {
  const existing = await prisma.client.findFirst({ where: { id, trainerId } });
  if (!existing) throw new AppError('Client not found', 404);
  return prisma.client.update({ where: { id }, data: { isActive: false } });
}

export async function getClientMetrics(id: string, trainerId: string) {
  const client = await prisma.client.findFirst({ where: { id, trainerId, isActive: true } });
  if (!client) throw new AppError('Client not found', 404);

  const metrics = computeAllMetrics(
    client.weightKg, client.heightCm, client.age,
    client.gender, client.activityLevel, client.fitnessGoal
  );
  return metrics;
}
