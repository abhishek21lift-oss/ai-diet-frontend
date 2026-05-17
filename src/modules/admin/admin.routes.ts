import { Router, Response, NextFunction } from 'express';
import { Client } from '../../models/Client';
import { DietPlan } from '../../models/DietPlan';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { authenticate, authorize } from '../../shared/middleware/authMiddleware';
import { AuthRequest } from '../../shared/types';
import { Types } from 'mongoose';

const router = Router();
router.use(authenticate);

router.get('/stats', authorize('TRAINER', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trainerId = req.user?.trainerId;
    const clientQuery = trainerId ? { trainerId: new Types.ObjectId(trainerId), isActive: true } : { isActive: true };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      totalDietPlans,
      newClientsThisMonth,
      recentClients,
      goalAgg,
      dietAgg,
    ] = await Promise.all([
      Client.countDocuments(clientQuery),
      // Aggregate diet plan count
      trainerId
        ? Client.aggregate([
            { $match: clientQuery },
            { $lookup: { from: 'dietplans', localField: '_id', foreignField: 'clientId', as: 'plans' } },
            { $project: { count: { $size: '$plans' } } },
            { $group: { _id: null, total: { $sum: '$count' } } },
          ]).then((r) => r[0]?.total || 0)
        : DietPlan.countDocuments(),
      Client.countDocuments({ ...clientQuery, createdAt: { $gte: thirtyDaysAgo } }),
      Client.find(clientQuery)
        .select('fullName fitnessGoal createdAt bmi')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .then((clients) => clients.map((c) => ({ ...c, id: c._id.toString() }))),
      Client.aggregate([
        { $match: clientQuery },
        { $group: { _id: '$fitnessGoal', count: { $sum: 1 } } },
        { $project: { _id: 0, fitnessGoal: '$_id', _count: '$count' } },
      ]),
      Client.aggregate([
        { $match: clientQuery },
        { $group: { _id: '$dietType', count: { $sum: 1 } } },
        { $project: { _id: 0, dietType: '$_id', _count: '$count' } },
      ]),
    ]);

    sendSuccess(res, {
      stats: {
        totalClients,
        totalDietPlans,
        newClientsThisMonth,
      },
      recentClients,
      goalBreakdown: goalAgg,
      dietTypeBreakdown: dietAgg,
    }, 'Dashboard stats');
  } catch (err) { next(err); }
});

export default router;
