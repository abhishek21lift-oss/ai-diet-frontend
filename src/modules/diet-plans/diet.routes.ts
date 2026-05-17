import { Router } from 'express';
import * as dietController from './diet.controller';
import { authenticate, authorize } from '../../shared/middleware/authMiddleware';
import { aiLimiter } from '../../shared/middleware/rateLimiter';

const router = Router({ mergeParams: true });
router.use(authenticate, authorize('TRAINER', 'ADMIN'));

router.post('/:clientId/diet-plans/generate', aiLimiter, dietController.generateDietPlan);
router.get('/:clientId/diet-plans', dietController.getDietPlans);
router.get('/diet-plans/:planId', dietController.getDietPlan);

export default router;
