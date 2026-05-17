export const ROLES = ['ADMIN', 'TRAINER', 'CLIENT'] as const;
export type Role = (typeof ROLES)[number];

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type Gender = (typeof GENDERS)[number];

export const BODY_TYPES = ['ECTOMORPH', 'MESOMORPH', 'ENDOMORPH'] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const ACTIVITY_LEVELS = [
  'SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE',
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const FITNESS_GOALS = [
  'FAT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'BODY_RECOMPOSITION',
] as const;
export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export const DIET_TYPES = ['VEG', 'VEGAN', 'NON_VEG', 'JAIN'] as const;
export type DietType = (typeof DIET_TYPES)[number];

export const WORKOUT_EXPERIENCES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type WorkoutExperience = (typeof WORKOUT_EXPERIENCES)[number];
