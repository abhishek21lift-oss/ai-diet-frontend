import { Router } from 'express';
import * as clientController from './client.controller';
import { authenticate, authorize } from '../../shared/middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('TRAINER', 'ADMIN'), clientController.createClient);
router.get('/', authorize('TRAINER', 'ADMIN'), clientController.getClients);
router.get('/:id', authorize('TRAINER', 'ADMIN'), clientController.getClient);
router.put('/:id', authorize('TRAINER', 'ADMIN'), clientController.updateClient);
router.delete('/:id', authorize('TRAINER', 'ADMIN'), clientController.deleteClient);
router.get('/:id/metrics', authorize('TRAINER', 'ADMIN'), clientController.getClientMetrics);

export default router;
