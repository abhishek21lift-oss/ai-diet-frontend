import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';
import { authLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
