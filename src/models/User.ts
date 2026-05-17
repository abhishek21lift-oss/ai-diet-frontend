import { Schema, model, Document, Types } from 'mongoose';
import { ROLES, Role } from '../shared/types/constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  refreshToken?: string | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, default: 'TRAINER' },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String, default: null },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
