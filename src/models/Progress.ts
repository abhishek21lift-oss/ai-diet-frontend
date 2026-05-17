import { Schema, model, Document, Types } from 'mongoose';

// ── Progress Record ──────────────────────────────────
export interface IProgressRecord extends Document {
  clientId: Types.ObjectId;
  recordedAt: Date;
  weightKg: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
  notes?: string;
}

const ProgressRecordSchema = new Schema<IProgressRecord>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  recordedAt: { type: Date, default: Date.now, index: true },
  weightKg: { type: Number, required: true },
  bodyFatPct: Number,
  chestCm: Number,
  waistCm: Number,
  hipCm: Number,
  armCm: Number,
  thighCm: Number,
  calfCm: Number,
  notes: String,
});

export const ProgressRecord = model<IProgressRecord>('ProgressRecord', ProgressRecordSchema);

// ── Weight History ───────────────────────────────────
export interface IWeightHistory extends Document {
  clientId: Types.ObjectId;
  weightKg: number;
  recordedAt: Date;
}

const WeightHistorySchema = new Schema<IWeightHistory>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  weightKg: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now },
});

export const WeightHistory = model<IWeightHistory>('WeightHistory', WeightHistorySchema);

// ── Weekly Check-In ──────────────────────────────────
export interface IWeeklyCheckIn extends Document {
  clientId: Types.ObjectId;
  weekNumber: number;
  year: number;
  compliance: number;
  workoutsCompleted: number;
  energyLevel: number;
  sleepQuality: number;
  stressLevel?: number;
  notes?: string;
  createdAt: Date;
}

const WeeklyCheckInSchema = new Schema<IWeeklyCheckIn>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  compliance: { type: Number, required: true, min: 0, max: 100 },
  workoutsCompleted: { type: Number, required: true },
  energyLevel: { type: Number, required: true, min: 1, max: 10 },
  sleepQuality: { type: Number, required: true, min: 1, max: 10 },
  stressLevel: { type: Number, min: 1, max: 10 },
  notes: String,
}, { timestamps: true });

export const WeeklyCheckIn = model<IWeeklyCheckIn>('WeeklyCheckIn', WeeklyCheckInSchema);

// ── Progress Photo ───────────────────────────────────
export interface IProgressPhoto extends Document {
  clientId: Types.ObjectId;
  photoUrl: string;
  s3Key?: string;
  photoType: string;
  takenAt: Date;
}

const ProgressPhotoSchema = new Schema<IProgressPhoto>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  photoUrl: { type: String, required: true },
  s3Key: String,
  photoType: { type: String, required: true },
  takenAt: { type: Date, default: Date.now },
});

export const ProgressPhoto = model<IProgressPhoto>('ProgressPhoto', ProgressPhotoSchema);
