import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { Trainer } from '../../models/Trainer';
import { AppError } from '../../shared/middleware/errorHandler';
import {
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
} from '../../shared/utils/jwtHelper';

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  gymName?: string;
  mobile?: string;
}

export async function registerTrainer(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(input.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  const user = await User.create({
    email: input.email,
    passwordHash,
    role: 'TRAINER',
  });

  const trainer = await Trainer.create({
    userId: user._id,
    fullName: input.fullName,
    gymName: input.gymName,
    mobile: input.mobile,
  });

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    trainerId: trainer._id.toString(),
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken, refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      trainer: {
        id: trainer._id.toString(),
        fullName: trainer.fullName,
        gymName: trainer.gymName,
      },
    },
  };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const trainer = user.role === 'TRAINER' ? await Trainer.findOne({ userId: user._id }) : null;

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    trainerId: trainer?._id.toString(),
  });
  const refreshToken = generateRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return {
    accessToken, refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      trainer: trainer ? {
        id: trainer._id.toString(),
        fullName: trainer.fullName,
        gymName: trainer.gymName,
      } : null,
    },
  };
}

export async function refreshTokens(token: string) {
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

  const trainer = user.role === 'TRAINER' ? await Trainer.findOne({ userId: user._id }) : null;

  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
    trainerId: trainer?._id.toString(),
  });
  const newRefreshToken = generateRefreshToken({
    userId: user._id.toString(),
    role: user.role,
  });

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId: string) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}
