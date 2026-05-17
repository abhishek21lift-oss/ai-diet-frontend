import { Client } from '../../models/Client';
import { DietPlan } from '../../models/DietPlan';
import { ProgressRecord, WeeklyCheckIn, ProgressPhoto } from '../../models/Progress';
import { AppError } from '../../shared/middleware/errorHandler';
import { computeAllMetrics, calculateAge } from '../../shared/utils/calculations';
import { Types } from 'mongoose';

export async function createClient(trainerId: string, data: any) {
  const age = calculateAge(new Date(data.dateOfBirth));
  const metrics = computeAllMetrics(
    data.weightKg, data.heightCm, age,
    data.gender, data.activityLevel, data.fitnessGoal
  );

  return Client.create({
    ...data,
    trainerId: new Types.ObjectId(trainerId),
    age,
    dateOfBirth: new Date(data.dateOfBirth),
    ...metrics,
  });
}

export async function getClients(
  trainerId: string,
  { page = 1, limit = 20, search = '', goal = '', bodyType = '' }: any
) {
  const skip = (page - 1) * limit;
  const query: any = { trainerId: new Types.ObjectId(trainerId), isActive: true };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search } },
    ];
  }
  if (goal) query.fitnessGoal = goal;
  if (bodyType) query.bodyType = bodyType;

  const [clients, total] = await Promise.all([
    Client.find(query)
      .select('fullName email mobile gender age weightKg heightCm fitnessGoal bodyType dietType bmi dailyCalories isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Client.countDocuments(query),
  ]);

  // Add diet plan counts
  const clientIds = clients.map((c) => c._id);
  const dietCounts = await DietPlan.aggregate([
    { $match: { clientId: { $in: clientIds } } },
    { $group: { _id: '$clientId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(dietCounts.map((d) => [d._id.toString(), d.count]));

  const clientsWithCounts = clients.map((c) => ({
    ...c,
    id: c._id.toString(),
    _count: { dietPlans: countMap.get(c._id.toString()) || 0 },
  }));

  return {
    clients: clientsWithCounts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getClientById(id: string, trainerId: string) {
  const client = await Client.findOne({
    _id: id,
    trainerId: new Types.ObjectId(trainerId),
    isActive: true,
  }).lean();
  if (!client) throw new AppError('Client not found', 404);

  const [activePlans, recordCount, checkInCount, photoCount] = await Promise.all([
    DietPlan.find({ clientId: client._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean(),
    ProgressRecord.countDocuments({ clientId: client._id }),
    WeeklyCheckIn.countDocuments({ clientId: client._id }),
    ProgressPhoto.countDocuments({ clientId: client._id }),
  ]);

  return {
    ...client,
    id: client._id.toString(),
    dietPlans: activePlans.map((p) => ({ ...p, id: p._id.toString() })),
    _count: {
      progressRecords: recordCount,
      checkIns: checkInCount,
      progressPhotos: photoCount,
    },
  };
}

export async function updateClient(id: string, trainerId: string, data: any) {
  const existing = await Client.findOne({ _id: id, trainerId: new Types.ObjectId(trainerId) });
  if (!existing) throw new AppError('Client not found', 404);

  const weightKg = data.weightKg ?? existing.weightKg;
  const heightCm = data.heightCm ?? existing.heightCm;
  const age = data.dateOfBirth
    ? calculateAge(new Date(data.dateOfBirth))
    : existing.age;
  const gender = data.gender ?? existing.gender;
  const activityLevel = data.activityLevel ?? existing.activityLevel;
  const fitnessGoal = data.fitnessGoal ?? existing.fitnessGoal;

  const metrics = computeAllMetrics(weightKg, heightCm, age, gender, activityLevel, fitnessGoal);

  return Client.findByIdAndUpdate(
    id,
    { ...data, age, ...metrics },
    { new: true }
  ).lean();
}

export async function deleteClient(id: string, trainerId: string) {
  const existing = await Client.findOne({ _id: id, trainerId: new Types.ObjectId(trainerId) });
  if (!existing) throw new AppError('Client not found', 404);
  return Client.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
}

export async function getClientMetrics(id: string, trainerId: string) {
  const client = await Client.findOne({
    _id: id,
    trainerId: new Types.ObjectId(trainerId),
    isActive: true,
  });
  if (!client) throw new AppError('Client not found', 404);

  return computeAllMetrics(
    client.weightKg, client.heightCm, client.age,
    client.gender, client.activityLevel, client.fitnessGoal
  );
}
