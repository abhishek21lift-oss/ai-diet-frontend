import { Schema, model, Document, Types } from 'mongoose';
import {
  GENDERS, BODY_TYPES, ACTIVITY_LEVELS, FITNESS_GOALS, DIET_TYPES, WORKOUT_EXPERIENCES,
  Gender, BodyType, ActivityLevel, FitnessGoal, DietType, WorkoutExperience,
} from '../shared/types/constants';

export interface IClient extends Document {
  _id: Types.ObjectId;
  trainerId: Types.ObjectId;
  userId?: Types.ObjectId | null;

  // Personal Info
  fullName: string;
  mobile: string;
  email: string;
  gender: Gender;
  dateOfBirth: Date;
  age: number;

  // Body Metrics
  heightCm: number;
  weightKg: number;
  bodyFatPct?: number;
  bodyType: BodyType;

  // Lifestyle
  activityLevel: ActivityLevel;
  sleepHours: number;
  waterIntakeLtr: number;
  workoutExperience: WorkoutExperience;

  // Goal
  fitnessGoal: FitnessGoal;

  // Nutrition Preferences
  dietType: DietType;
  allergies: string[];
  foodsToAvoid: string[];

  // Medical
  medicalConditions: string[];
  injuries: string[];
  medications: string[];

  // Notes
  notes?: string;

  // Calculated Metrics
  bmi?: number;
  bmr?: number;
  tdee?: number;
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

  fullName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  gender: { type: String, enum: GENDERS, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },

  heightCm: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  bodyFatPct: Number,
  bodyType: { type: String, enum: BODY_TYPES, required: true },

  activityLevel: { type: String, enum: ACTIVITY_LEVELS, required: true },
  sleepHours: { type: Number, required: true },
  waterIntakeLtr: { type: Number, required: true },
  workoutExperience: { type: String, enum: WORKOUT_EXPERIENCES, required: true },

  fitnessGoal: { type: String, enum: FITNESS_GOALS, required: true },

  dietType: { type: String, enum: DIET_TYPES, required: true },
  allergies: { type: [String], default: [] },
  foodsToAvoid: { type: [String], default: [] },

  medicalConditions: { type: [String], default: [] },
  injuries: { type: [String], default: [] },
  medications: { type: [String], default: [] },

  notes: String,

  bmi: Number,
  bmr: Number,
  tdee: Number,
  dailyCalories: Number,
  proteinGrams: Number,
  carbsGrams: Number,
  fatsGrams: Number,

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ClientSchema.index({ trainerId: 1, isActive: 1 });

export const Client = model<IClient>('Client', ClientSchema);
