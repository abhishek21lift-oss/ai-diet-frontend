import { Router } from 'express';
import { Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { sendSuccess } from '../../shared/utils/apiResponse';
import { authenticate, authorize } from '../../shared/middleware/authMiddleware';
import { AuthRequest } from '../../shared/types';

const router = Router();
router.use(authenticate);

router.get('/stats', authorize('TRAINER', 'ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats(req.user?.trainerId);
    sendSuccess(res, stats, 'Dashboard stats');
  } catch (err) { next(err); }
});

export default router;
