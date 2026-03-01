import Analytics, { IAnalytics } from '../models/Analytics';
import Progress, { IProgress } from '../models/Progress';
import Session, { ISession } from '../models/Session';
import mongoose from 'mongoose';

export class AnalyticsService {
  /**
   * Recalculate and persist a student's full analytics record after a session completes.
   */
  static async updateStudentAnalytics(
    studentId: string,
    completedSession: ISession
  ): Promise<void> {
    const studentObjId = new mongoose.Types.ObjectId(studentId);

    const [analytics, allSessions] = await Promise.all([
      Analytics.findOne({ student: studentObjId }),
      Session.find({ student: studentObjId, status: 'completed' }).populate(
        'experiment',
        'category maxScore'
      ),
    ]);

    if (!analytics) return;

    const totalSessions = allSessions.length;
    const totalTime = allSessions.reduce((sum, s) => sum + (s.totalTimeSeconds / 60), 0);
    const avgScore =
      totalSessions > 0
        ? allSessions.reduce((sum, s) => sum + s.finalScore, 0) / totalSessions
        : 0;
    const avgAccuracy =
      totalSessions > 0
        ? allSessions.reduce((sum, s) => sum + s.accuracyPercent, 0) / totalSessions
        : 0;
    const highestScore = Math.max(...allSessions.map((s) => s.finalScore), 0);

    const experimentIds = [...new Set(allSessions.map((s) => s.experiment.toString()))].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Weekly activity: count sessions per day of week
    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
    allSessions.forEach((s) => {
      if (s.completedAt) {
        const day = new Date(s.completedAt).getDay();
        weeklyActivity[day]++;
      }
    });

    // Engagement score: composite metric
    const completionRate = totalSessions > 0 ? (totalSessions / (totalSessions + 1)) * 100 : 0;
    const engagementScore = Math.min(
      100,
      Math.round(completionRate * 0.4 + avgAccuracy * 0.4 + Math.min(totalTime / 60, 10) * 2)
    );

    // Risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgAccuracy < 40 || engagementScore < 30) riskLevel = 'high';
    else if (avgAccuracy < 60 || engagementScore < 50) riskLevel = 'medium';

    analytics.totalSessions = totalSessions;
    analytics.completedSessions = totalSessions;
    analytics.totalTimeSpentMinutes = Math.round(totalTime);
    analytics.averageScore = Math.round(avgScore * 100) / 100;
    analytics.averageAccuracy = Math.round(avgAccuracy * 100) / 100;
    analytics.highestScore = highestScore;
    analytics.experimentsAttempted = experimentIds;
    analytics.experimentsCompleted = experimentIds;
    analytics.weeklyActivity = weeklyActivity;
    analytics.engagementScore = engagementScore;
    analytics.riskLevel = riskLevel;
    analytics.lastActiveAt = new Date();

    await analytics.save();

    // Update progress record
    await AnalyticsService.updateProgressRecord(studentObjId, completedSession, allSessions);
  }

  private static async updateProgressRecord(
    studentId: mongoose.Types.ObjectId,
    latestSession: ISession,
    allSessions: ISession[]
  ): Promise<void> {
    let progress = await Progress.findOne({ student: studentId });
    if (!progress) {
      progress = await Progress.create({ student: studentId });
    }

    const experimentId = latestSession.experiment.toString();
    const experimentSessions = allSessions.filter(
      (s) => s.experiment.toString() === experimentId
    );

    const bestScore = Math.max(...experimentSessions.map((s) => s.finalScore), 0);
    const totalTime = experimentSessions.reduce((sum, s) => sum + s.totalTimeSeconds / 60, 0);

    let status: 'not_started' | 'in_progress' | 'completed' | 'mastered' = 'in_progress';
    if (latestSession.accuracyPercent >= 90) status = 'mastered';
    else if (latestSession.status === 'completed') status = 'completed';

    const existingEntry = progress.experimentProgress.find(
      (ep) => ep.experiment.toString() === experimentId
    );

    if (existingEntry) {
      existingEntry.bestScore = bestScore;
      existingEntry.attempts = experimentSessions.length;
      existingEntry.completionStatus = status;
      existingEntry.lastAttemptAt = new Date();
      existingEntry.totalTimeMinutes = Math.round(totalTime);
    } else {
      progress.experimentProgress.push({
        experiment: latestSession.experiment,
        bestScore,
        attempts: experimentSessions.length,
        completionStatus: status,
        lastAttemptAt: new Date(),
        totalTimeMinutes: Math.round(totalTime),
        conceptsLearned: [],
      });
    }

    // Recalculate overall percent
    const completedCount = progress.experimentProgress.filter(
      (ep) => ep.completionStatus === 'completed' || ep.completionStatus === 'mastered'
    ).length;

    const overallPercent =
      progress.experimentProgress.length > 0
        ? (completedCount / progress.experimentProgress.length) * 100
        : 0;

    progress.overallPercent = Math.round(overallPercent);

    // Experience points
    progress.experiencePoints += Math.round(latestSession.finalScore * 1.5);
    progress.currentLevel = Math.floor(progress.experiencePoints / 500) + 1;

    await progress.save();
  }
}
