import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Experiment from '../models/Experiment';
import Session from '../models/Session';
import { AnalyticsService } from '../services/analyticsService';

// ─── GET /api/v1/experiments ──────────────────────────────────────────────────
export const getAllExperiments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, difficulty, search, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = { isActive: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search as string };

    const skip = (Number(page) - 1) * Number(limit);
    const [experiments, total] = await Promise.all([
      Experiment.find(query)
        .select('-steps -equipment')
        .populate('createdBy', 'firstName lastName')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Experiment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        experiments,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/experiments/:id ──────────────────────────────────────────────
export const getExperimentById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const experiment = await Experiment.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName'
    );
    if (!experiment) {
      res.status(404).json({ success: false, message: 'Experiment not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { experiment } });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/experiments ─────────────────────────────────────────────────
export const createExperiment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const experiment = await Experiment.create({
      ...req.body,
      createdBy: req.user?._id,
    });
    res.status(201).json({
      success: true,
      message: 'Experiment created successfully.',
      data: { experiment },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/experiments/:id/session ────────────────────────────────────
export const startSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      res.status(404).json({ success: false, message: 'Experiment not found.' });
      return;
    }

    // Close any existing active session for this student/experiment
    await Session.findOneAndUpdate(
      { student: req.user?._id, experiment: experiment._id, status: 'active' },
      { status: 'abandoned' }
    );

    const session = await Session.create({
      student: req.user?._id,
      experiment: experiment._id,
      maxScore: experiment.maxScore,
      deviceType: req.body.deviceType || 'desktop',
      stepResults: experiment.steps.map((s) => ({
        stepNumber: s.stepNumber,
        completed: false,
        score: 0,
        attemptCount: 0,
        hintsUsed: 0,
        timeSpentSeconds: 0,
        observations: '',
      })),
    });

    res.status(201).json({
      success: true,
      message: 'Experiment session started.',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/experiments/sessions/:sessionId ──────────────────────────────
export const updateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      student: req.user?._id,
    });

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const { stepResults, status, finalScore, totalTimeSeconds, arInteractions, notes } = req.body;

    if (stepResults) session.stepResults = stepResults;
    if (status) session.status = status;
    if (finalScore !== undefined) session.finalScore = finalScore;
    if (totalTimeSeconds !== undefined) session.totalTimeSeconds = totalTimeSeconds;
    if (arInteractions !== undefined) session.arInteractions = arInteractions;
    if (notes) session.notes = notes;

    if (status === 'completed') {
      session.completedAt = new Date();
      // Update analytics asynchronously
      if (req.user?._id) {
        AnalyticsService.updateStudentAnalytics(req.user._id.toString(), session).catch(
          console.error
        );
      }
    }

    await session.save();
    res.status(200).json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/experiments/:id/sessions ────────────────────────────────────
export const getMySessionsForExperiment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await Session.find({
      student: req.user?._id,
      experiment: req.params.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
};
