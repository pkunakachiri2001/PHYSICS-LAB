import { Router } from 'express';
import {
  getMyAnalytics,
  getStudentAnalytics,
  getClassAnalytics,
  getPlatformOverview,
} from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/me', protect, getMyAnalytics);
router.get('/overview', protect, authorize('admin'), getPlatformOverview);
router.get('/class/:classGroup', protect, authorize('educator', 'admin'), getClassAnalytics);
router.get('/student/:studentId', protect, authorize('educator', 'admin'), getStudentAnalytics);

export default router;
