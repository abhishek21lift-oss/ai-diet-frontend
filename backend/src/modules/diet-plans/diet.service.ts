import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import { generateAIDietPlan } from './ai.service';

export async function generateDietPlan(clientId: string, trainerId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, trainerId, isActive: true },
  });
  if (!client) throw new AppError('Client not found', 404);

  if (!client.dailyCalories) throw new AppError('Client metrics not calculated', 400);

  const { parsed, prompt } = await generateAIDietPlan({
    clientName: client.fullName,
    goal: client.fitnessGoal,
    dailyCalories: client.dailyCalories,
    proteinGrams: client.proteinGrams || 150,
    carbsGrams: client.carbsGrams || 200,
    fatsGrams: client.fatsGrams || 60,
    bodyType: client.bodyType,
    dietType: client.dietType,
    activityLevel: client.activityLevel,
    medicalConditions: client.medicalConditions,
    allergies: client.allergies,
    foodsToAvoid: client.foodsToAvoid,
    weightKg: client.weightKg,
  });

  // Deactivate previous plans
  await prisma.dietPlan.updateMany({
    where: { clientId, isActive: true },
    data: { isActive: false },
  });

  // Save new plan
  const plan = await prisma.dietPlan.create({
    data: {
      clientId,
      planName: `AI Plan — ${new Date().toLocaleDateString('en-IN')}`,
      startDate: new Date(),
      totalCalories: parsed.totalCalories || client.dailyCalories,
      proteinGrams: parsed.totalProtein || client.proteinGrams || 150,
      carbsGrams: parsed.totalCarbs || client.carbsGrams || 200,
      fatsGrams: parsed.totalFats || client.fatsGrams || 60,
      aiGenerated: true,
      aiModel: 'claude-opus-4',
      promptUsed: prompt,
      planSummary: parsed.planSummary,
      trainerNotes: parsed.trainerNotes,
      hydrationTips: parsed.hydrationTips,
      supplementSuggestions: parsed.supplementSuggestions || [],
      meals: {
        create: (parsed.meals || []).map((meal: any, idx: number) => ({
          mealName: meal.mealName,
          mealTime: meal.mealTime,
          calories: meal.calories,
          proteinGrams: meal.proteinGrams,
          carbsGrams: meal.carbsGrams,
          fatsGrams: meal.fatsGrams,
          sortOrder: idx,
          foods: {
            create: (meal.foods || []).map((food: any) => ({
              foodName: food.foodName,
              quantity: food.quantity,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fats: food.fats,
              alternatives: food.alternatives || [],
            })),
          },
        })),
      },
    },
    include: { meals: { include: { foods: true } } },
  });

  return plan;
}

export async function getDietPlans(clientId: string, trainerId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, trainerId } });
  if (!client) throw new AppError('Client not found', 404);

  return prisma.dietPlan.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    include: { meals: { include: { foods: true }, orderBy: { sortOrder: 'asc' } } },
  });
}

export async function getDietPlanById(planId: string, trainerId: string) {
  const plan = await prisma.dietPlan.findUnique({
    where: { id: planId },
    include: {
      meals: { include: { foods: true }, orderBy: { sortOrder: 'asc' } },
      client: { select: { trainerId: true, fullName: true } },
    },
  });
  if (!plan || plan.client.trainerId !== trainerId) throw new AppError('Diet plan not found', 404);
  return plan;
}
