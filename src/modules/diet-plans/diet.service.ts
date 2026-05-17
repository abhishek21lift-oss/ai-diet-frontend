import { Client } from '../../models/Client';
import { DietPlan } from '../../models/DietPlan';
import { AppError } from '../../shared/middleware/errorHandler';
import { generateAIDietPlan } from './ai.service';
import { Types } from 'mongoose';

export async function generateDietPlan(clientId: string, trainerId: string) {
  const client = await Client.findOne({
    _id: clientId,
    trainerId: new Types.ObjectId(trainerId),
    isActive: true,
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
  await DietPlan.updateMany(
    { clientId: client._id, isActive: true },
    { $set: { isActive: false } }
  );

  // Save new plan with embedded meals
  const plan = await DietPlan.create({
    clientId: client._id,
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
    meals: (parsed.meals || []).map((meal: any, idx: number) => ({
      mealName: meal.mealName,
      mealTime: meal.mealTime,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbsGrams: meal.carbsGrams,
      fatsGrams: meal.fatsGrams,
      sortOrder: idx,
      foods: (meal.foods || []).map((food: any) => ({
        foodName: food.foodName,
        quantity: food.quantity,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        alternatives: food.alternatives || [],
      })),
    })),
  });

  return plan.toObject();
}

export async function getDietPlans(clientId: string, trainerId: string) {
  const client = await Client.findOne({ _id: clientId, trainerId: new Types.ObjectId(trainerId) });
  if (!client) throw new AppError('Client not found', 404);

  return DietPlan.find({ clientId: client._id })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getDietPlanById(planId: string, trainerId: string) {
  const plan = await DietPlan.findById(planId).lean();
  if (!plan) throw new AppError('Diet plan not found', 404);

  const client = await Client.findById(plan.clientId);
  if (!client || client.trainerId.toString() !== trainerId) {
    throw new AppError('Diet plan not found', 404);
  }
  return plan;
}
