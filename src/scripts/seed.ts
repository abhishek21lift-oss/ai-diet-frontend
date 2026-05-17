import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Trainer } from '../models/Trainer';
import { Client } from '../models/Client';

async function seed() {
  console.log('🌱 Seeding database...');
  await connectDatabase();

  // Clear existing demo data (optional - comment out for production)
  // await User.deleteMany({});
  // await Trainer.deleteMany({});
  // await Client.deleteMany({});

  // Admin
  const adminHash = await bcrypt.hash('Admin@619', 12);
  await User.findOneAndUpdate(
    { email: 'admin@619fitness.com' },
    {
      email: 'admin@619fitness.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
    { upsert: true, new: true }
  );

  // Trainer
  const trainerHash = await bcrypt.hash('Trainer@619', 12);
  const trainerUser = await User.findOneAndUpdate(
    { email: 'abhishek@619fitness.com' },
    {
      email: 'abhishek@619fitness.com',
      passwordHash: trainerHash,
      role: 'TRAINER',
    },
    { upsert: true, new: true }
  );

  const trainer = await Trainer.findOneAndUpdate(
    { userId: trainerUser._id },
    {
      userId: trainerUser._id,
      fullName: 'Abhishek',
      mobile: '+91-9999999999',
      gymName: '619 Fitness Studio',
      certification: 'K11 Certified Personal Trainer',
      bio: 'Head Trainer & Professional Powerlifter | SQ: 230kg | BP: 150kg | DL: 260kg',
    },
    { upsert: true, new: true }
  );

  // Sample Client
  await Client.findOneAndUpdate(
    { email: 'sample@client.com' },
    {
      trainerId: trainer._id,
      fullName: 'Rahul Sharma',
      mobile: '+91-8888888888',
      email: 'sample@client.com',
      gender: 'MALE',
      dateOfBirth: new Date('1995-06-15'),
      age: 29,
      heightCm: 175,
      weightKg: 82,
      bodyFatPct: 18,
      bodyType: 'MESOMORPH',
      activityLevel: 'MODERATELY_ACTIVE',
      sleepHours: 7,
      waterIntakeLtr: 2.5,
      workoutExperience: 'INTERMEDIATE',
      fitnessGoal: 'FAT_LOSS',
      dietType: 'NON_VEG',
      allergies: [],
      foodsToAvoid: ['Dairy'],
      medicalConditions: [],
      injuries: [],
      medications: [],
      bmi: 26.8,
      bmr: 1890,
      tdee: 2929,
      dailyCalories: 2429,
      proteinGrams: 180,
      carbsGrams: 240,
      fatsGrams: 67,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log('✅ Seed complete!');
  console.log('📧 Admin:   admin@619fitness.com / Admin@619');
  console.log('📧 Trainer: abhishek@619fitness.com / Trainer@619');

  await disconnectDatabase();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
