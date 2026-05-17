import { Request } from 'express';

export interface AuthUser {
  id: string;
  role: string;
  trainerId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HealthMetrics {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}
