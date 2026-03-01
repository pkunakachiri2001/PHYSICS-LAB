import { Router } from 'express';
import {
  getAllExperiments,
  getExperimentById,
  createExperiment,
  startSession,
  updateSession,
  getMySessionsForExperiment,
} from '../controllers/experimentController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Experiment CRUD
router.get('/', protect, getAllExperiments);
router.get('/:id', protect, getExperimentById);
router.post('/', protect, authorize('educator', 'admin'), createExperiment);

// Session management
router.post('/:id/session', protect, authorize('student'), startSession);
router.put('/sessions/:sessionId', protect, updateSession);
router.get('/:id/sessions', protect, getMySessionsForExperiment);

export default router;
