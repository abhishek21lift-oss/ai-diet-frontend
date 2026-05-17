import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../shared/utils/jwtHelper';

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  gymName?: string;
  mobile?: string;
}

export async function registerTrainer(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(input.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: 'TRAINER',
      trainer: {
        create: {
          fullName: input.fullName,
          gymName: input.gymName,
          mobile: input.mobile,
        },
      },
    },
    include: { trainer: true },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, trainerId: user.trainer?.id });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      trainer: user.trainer,
    },
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { trainer: true },
  });

  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    trainerId: user.trainer?.id,
  });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLogin: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      trainer: user.trainer,
    },
  };
}

export async function refreshTokens(token: string) {
  const decoded = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { trainer: true },
  });

  if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    trainerId: user.trainer?.id,
  });
  const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}
