import { Schema, model, Document, Types } from 'mongoose';

export interface ITrainer extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  mobile?: string;
  gymName?: string;
  certification?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  mobile: String,
  gymName: String,
  certification: String,
  bio: String,
  avatarUrl: String,
}, { timestamps: true });

export const Trainer = model<ITrainer>('Trainer', TrainerSchema);
