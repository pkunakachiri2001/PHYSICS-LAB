import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getMyProgress,
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.get('/me/progress', protect, getMyProgress);

// Admin-only routes
router.get('/', protect, authorize('admin', 'educator'), getAllUsers);
router.get('/:id', protect, authorize('admin', 'educator'), getUserById);
router.patch('/:id/status', protect, authorize('admin'), toggleUserStatus);

export default router;
