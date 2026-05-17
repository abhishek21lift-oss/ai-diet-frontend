import { HealthMetrics } from '../types';

// BMI calculation
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Mifflin-St Jeor Equation (most accurate)
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'MALE' ? base + 5 : base - 161);
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: string): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));
}

const CALORIE_ADJUSTMENTS: Record<string, number> = {
  FAT_LOSS: -500,
  MUSCLE_GAIN: 300,
  MAINTENANCE: 0,
  BODY_RECOMPOSITION: -200,
};

export function calculateDailyCalories(tdee: number, goal: string): number {
  return tdee + (CALORIE_ADJUSTMENTS[goal] || 0);
}

const PROTEIN_MULTIPLIERS: Record<string, number> = {
  FAT_LOSS: 2.2,
  MUSCLE_GAIN: 2.0,
  MAINTENANCE: 1.8,
  BODY_RECOMPOSITION: 2.2,
};

export function calculateMacros(
  calories: number,
  goal: string,
  weightKg: number
): { proteinGrams: number; carbsGrams: number; fatsGrams: number } {
  const proteinGrams = Math.round(weightKg * (PROTEIN_MULTIPLIERS[goal] || 1.8));
  const proteinCals = proteinGrams * 4;
  const fatCals = calories * 0.25;
  const fatGrams = Math.round(fatCals / 9);
  const carbGrams = Math.round((calories - proteinCals - fatCals) / 4);
  return { proteinGrams, carbsGrams: carbGrams, fatsGrams: fatGrams };
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--;
  return age;
}

export function computeAllMetrics(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  fitnessGoal: string
): HealthMetrics {
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalories = calculateDailyCalories(tdee, fitnessGoal);
  const macros = calculateMacros(dailyCalories, fitnessGoal, weightKg);
  return { bmi, bmiCategory, bmr, tdee, dailyCalories, ...macros };
}
