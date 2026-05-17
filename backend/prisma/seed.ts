import { PrismaClient, Role, Gender, BodyType, ActivityLevel, FitnessGoal, DietType, WorkoutExperience } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminHash = await bcrypt.hash('Admin@619', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@619fitness.com' },
    update: {},
    create: {
      email: 'admin@619fitness.com',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // Create Trainer
  const trainerHash = await bcrypt.hash('Trainer@619', 12);
  const trainerUser = await prisma.user.upsert({
    where: { email: 'abhishek@619fitness.com' },
    update: {},
    create: {
      email: 'abhishek@619fitness.com',
      passwordHash: trainerHash,
      role: Role.TRAINER,
      trainer: {
        create: {
          fullName: 'Abhishek',
          mobile: '+91-9999999999',
          gymName: '619 Fitness Studio',
          certification: 'K11 Certified Personal Trainer',
          bio: 'Head Trainer & Professional Powerlifter | SQ: 230kg | BP: 150kg | DL: 260kg',
        },
      },
    },
    include: { trainer: true },
  });

  const trainer = await prisma.trainer.findUnique({ where: { userId: trainerUser.id } });

  // Create sample client
  if (trainer) {
    await prisma.client.upsert({
      where: { email: 'sample@client.com' } as any,
      update: {},
      create: {
        trainerId: trainer.id,
        fullName: 'Rahul Sharma',
        mobile: '+91-8888888888',
        email: 'sample@client.com',
        gender: Gender.MALE,
        dateOfBirth: new Date('1995-06-15'),
        age: 29,
        heightCm: 175,
        weightKg: 82,
        bodyFatPct: 18,
        bodyType: BodyType.MESOMORPH,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        sleepHours: 7,
        waterIntakeLtr: 2.5,
        workoutExperience: WorkoutExperience.INTERMEDIATE,
        fitnessGoal: FitnessGoal.FAT_LOSS,
        dietType: DietType.NON_VEG,
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
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('📧 Admin:   admin@619fitness.com / Admin@619');
  console.log('📧 Trainer: abhishek@619fitness.com / Trainer@619');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
