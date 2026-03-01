import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Analytics from '../models/Analytics';
import Progress from '../models/Progress';

// ─── GET /api/v1/users/me ─────────────────────────────────────────────────────
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/v1/users/me ─────────────────────────────────────────────────────
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowedFields = ['firstName', 'lastName', 'institution', 'classGroup', 'avatar'];
    const updates: Record<string, string> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user?._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users (admin) ────────────────────────────────────────────────
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, classGroup, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};

    if (role) query.role = role;
    if (classGroup) query.classGroup = classGroup;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
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

// ─── GET /api/v1/users/:id (admin/educator) ───────────────────────────────────
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/users/:id/status (admin) ───────────────────────────────────
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/users/me/progress ────────────────────────────────────────────
export const getMyProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const progress = await Progress.findOne({ student: req.user?._id }).populate(
      'experimentProgress.experiment',
      'title category difficulty thumbnailUrl'
    );

    res.status(200).json({ success: true, data: { progress } });
  } catch (error) {
    next(error);
  }
};
