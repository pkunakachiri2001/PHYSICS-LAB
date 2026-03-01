import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Analytics from '../models/Analytics';
import Progress from '../models/Progress';
import Session from '../models/Session';
import User from '../models/User';
import { AIService } from '../services/aiService';

// ─── GET /api/v1/analytics/me ─────────────────────────────────────────────────
export const getMyAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analytics = await Analytics.findOne({ student: req.user?._id })
      .populate('experimentsAttempted', 'title category')
      .populate('experimentsCompleted', 'title category');

    if (!analytics) {
      res.status(404).json({ success: false, message: 'Analytics record not found.' });
      return;
    }

    // Generate fresh AI insights
    const insights = await AIService.generateInsights(analytics);
    analytics.aiInsights = insights;
    await analytics.save();

    res.status(200).json({ success: true, data: { analytics } });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/analytics/student/:studentId ─────────────────────────────────
export const getStudentAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId } = req.params;

    const [analytics, progress, recentSessions] = await Promise.all([
      Analytics.findOne({ student: studentId })
        .populate('experimentsAttempted', 'title category difficulty')
        .populate('experimentsCompleted', 'title category difficulty'),
      Progress.findOne({ student: studentId }).populate(
        'experimentProgress.experiment',
        'title category'
      ),
      Session.find({ student: studentId, status: 'completed' })
        .populate('experiment', 'title category')
        .sort({ completedAt: -1 })
        .limit(10),
    ]);

    if (!analytics) {
      res.status(404).json({ success: false, message: 'Student analytics not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { analytics, progress, recentSessions },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/analytics/class/:classGroup ──────────────────────────────────
export const getClassAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { classGroup } = req.params;

    const students = await User.find({ classGroup, role: 'student', isActive: true }).select(
      '_id firstName lastName email studentId'
    );

    const studentIds = students.map((s) => s._id);

    const [analyticsRecords, progressRecords] = await Promise.all([
      Analytics.find({ student: { $in: studentIds } }),
      Progress.find({ student: { $in: studentIds } }),
    ]);

    // Aggregate class-level metrics
    const totalStudents = students.length;
    const avgAccuracy =
      analyticsRecords.length > 0
        ? analyticsRecords.reduce((sum, a) => sum + a.averageAccuracy, 0) / analyticsRecords.length
        : 0;
    const avgScore =
      analyticsRecords.length > 0
        ? analyticsRecords.reduce((sum, a) => sum + a.averageScore, 0) / analyticsRecords.length
        : 0;
    const avgEngagement =
      analyticsRecords.length > 0
        ? analyticsRecords.reduce((sum, a) => sum + a.engagementScore, 0) / analyticsRecords.length
        : 0;

    const riskDistribution = {
      low: analyticsRecords.filter((a) => a.riskLevel === 'low').length,
      medium: analyticsRecords.filter((a) => a.riskLevel === 'medium').length,
      high: analyticsRecords.filter((a) => a.riskLevel === 'high').length,
    };

    const studentsData = students.map((student) => {
      const analytics = analyticsRecords.find(
        (a) => a.student.toString() === student._id.toString()
      );
      const progress = progressRecords.find(
        (p) => p.student.toString() === student._id.toString()
      );
      return {
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          studentId: student.studentId,
        },
        averageScore: analytics?.averageScore || 0,
        averageAccuracy: analytics?.averageAccuracy || 0,
        engagementScore: analytics?.engagementScore || 0,
        completedExperiments: analytics?.completedSessions || 0,
        totalSessions: analytics?.totalSessions || 0,
        overallGrade: progress?.overallGrade || 'N/A',
        riskLevel: analytics?.riskLevel || 'low',
        lastActiveAt: analytics?.lastActiveAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        classGroup,
        totalStudents,
        classSummary: {
          avgAccuracy: Math.round(avgAccuracy * 100) / 100,
          avgScore: Math.round(avgScore * 100) / 100,
          avgEngagement: Math.round(avgEngagement * 100) / 100,
          riskDistribution,
        },
        students: studentsData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/analytics/overview (admin) ───────────────────────────────────
export const getPlatformOverview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalEducators,
      totalSessions,
      recentSessions,
      avgAnalytics,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'educator', isActive: true }),
      Session.countDocuments(),
      Session.find({ status: 'completed' })
        .populate('student', 'firstName lastName classGroup')
        .populate('experiment', 'title category')
        .sort({ completedAt: -1 })
        .limit(20),
      Analytics.aggregate([
        {
          $group: {
            _id: null,
            avgAccuracy: { $avg: '$averageAccuracy' },
            avgScore: { $avg: '$averageScore' },
            avgEngagement: { $avg: '$engagementScore' },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalEducators,
          totalSessions,
          platformAvgAccuracy: Math.round((avgAnalytics[0]?.avgAccuracy || 0) * 100) / 100,
          platformAvgScore: Math.round((avgAnalytics[0]?.avgScore || 0) * 100) / 100,
          platformAvgEngagement: Math.round((avgAnalytics[0]?.avgEngagement || 0) * 100) / 100,
        },
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};
