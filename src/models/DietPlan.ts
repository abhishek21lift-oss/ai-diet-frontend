import { Schema, model, Document, Types } from 'mongoose';

// Sub-schemas (embedded documents — perfect for MongoDB)
interface IMealFood {
  foodName: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  alternatives: string[];
}

interface IMeal {
  mealName: string;
  mealTime: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  sortOrder: number;
  foods: IMealFood[];
}

export interface IDietPlan extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  planName: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;

  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;

  aiGenerated: boolean;
  aiModel?: string;
  promptUsed?: string;
  planSummary?: string;
  trainerNotes?: string;
  hydrationTips?: string;
  supplementSuggestions: string[];

  meals: IMeal[];
  createdAt: Date;
  updatedAt: Date;
}

const MealFoodSchema = new Schema<IMealFood>({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  alternatives: { type: [String], default: [] },
}, { _id: false });

const MealSchema = new Schema<IMeal>({
  mealName: { type: String, required: true },
  mealTime: { type: String, required: true },
  calories: { type: Number, required: true },
  proteinGrams: { type: Number, required: true },
  carbsGrams: { type: Number, required: true },
  fatsGrams: { type: Number, required: true },
  sortOrder: { type: Number, default: 0 },
  foods: { type: [MealFoodSchema], default: [] },
}, { _id: true });

const DietPlanSchema = new Schema<IDietPlan>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  planName: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  isActive: { type: Boolean, default: true },

  totalCalories: { type: Number, required: true },
  proteinGrams: { type: Number, required: true },
  carbsGrams: { type: Number, required: true },
  fatsGrams: { type: Number, required: true },

  aiGenerated: { type: Boolean, default: false },
  aiModel: String,
  promptUsed: String,
  planSummary: String,
  trainerNotes: String,
  hydrationTips: String,
  supplementSuggestions: { type: [String], default: [] },

  meals: { type: [MealSchema], default: [] },
}, { timestamps: true });

export const DietPlan = model<IDietPlan>('DietPlan', DietPlanSchema);
