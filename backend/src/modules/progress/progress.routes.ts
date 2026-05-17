import { Router } from 'express';
import * as progressController from './progress.controller';
import { authenticate, authorize } from '../../shared/middleware/authMiddleware';

const router = Router({ mergeParams: true });
router.use(authenticate, authorize('TRAINER', 'ADMIN'));

router.post('/:clientId/progress', progressController.addProgress);
router.get('/:clientId/progress', progressController.getProgress);
router.get('/:clientId/weight-history', progressController.getWeightHistory);
router.post('/:clientId/checkins', progressController.addCheckIn);
router.get('/:clientId/checkins', progressController.getCheckIns);

export default router;
