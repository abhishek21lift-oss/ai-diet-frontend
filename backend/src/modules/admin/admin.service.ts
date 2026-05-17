import { prisma } from '../../config/database';

export async function getDashboardStats(trainerId?: string) {
  const clientWhere = trainerId ? { trainerId, isActive: true } : { isActive: true };

  const [
    totalClients,
    totalDietPlans,
    activeClients,
    recentClients,
    goalBreakdown,
    dietTypeBreakdown,
  ] = await Promise.all([
    prisma.client.count({ where: clientWhere }),
    prisma.dietPlan.count({ where: trainerId ? { client: { trainerId } } : {} }),
    prisma.client.count({ where: { ...clientWhere, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    prisma.client.findMany({
      where: clientWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, fitnessGoal: true, createdAt: true, bmi: true },
    }),
    prisma.client.groupBy({
      by: ['fitnessGoal'],
      where: clientWhere,
      _count: true,
    }),
    prisma.client.groupBy({
      by: ['dietType'],
      where: clientWhere,
      _count: true,
    }),
  ]);

  return {
    stats: {
      totalClients,
      totalDietPlans,
      newClientsThisMonth: activeClients,
    },
    recentClients,
    goalBreakdown,
    dietTypeBreakdown,
  };
}
