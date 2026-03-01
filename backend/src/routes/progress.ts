import { Router, Response, NextFunction } from 'express';
import { protect, authorize, AuthRequest } from '../middleware/auth';
import Progress from '../models/Progress';

const router = Router();

// GET /api/v1/progress/me
router.get('/me', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const progress = await Progress.findOne({ student: req.user?._id }).populate(
      'experimentProgress.experiment',
      'title category difficulty thumbnailUrl estimatedDuration'
    );
    res.status(200).json({ success: true, data: { progress } });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/progress/student/:studentId (educator/admin)
router.get(
  '/student/:studentId',
  protect,
  authorize('educator', 'admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const progress = await Progress.findOne({ student: req.params.studentId }).populate(
        'experimentProgress.experiment',
        'title category difficulty'
      );
      if (!progress) {
        res.status(404).json({ success: false, message: 'Progress record not found.' });
        return;
      }
      res.status(200).json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
