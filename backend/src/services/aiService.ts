import { IAnalytics } from '../models/Analytics';

/**
 * AIService — Rule-based & statistical AI engine for learning analytics.
 * Generates personalised insights, identifies conceptual gaps, and
 * predicts at-risk students based on engagement and performance patterns.
 */
export class AIService {
  /**
   * Generate AI-powered learning insights for a student based on their analytics data.
   */
  static async generateInsights(analytics: IAnalytics): Promise<string[]> {
    const insights: string[] = [];

    // ── Engagement Analysis ───────────────────────────────────────────────────
    if (analytics.engagementScore >= 80) {
      insights.push('Excellent engagement! You consistently interact with experiments deeply.');
    } else if (analytics.engagementScore >= 50) {
      insights.push(
        'Good engagement level. Try increasing the number of AR interactions per session to deepen understanding.'
      );
    } else {
      insights.push(
        'Your engagement score is low. Consider spending more time with each experiment step before proceeding.'
      );
    }

    // ── Accuracy Analysis ─────────────────────────────────────────────────────
    if (analytics.averageAccuracy >= 85) {
      insights.push(
        'Outstanding accuracy across experiments. You demonstrate strong conceptual mastery.'
      );
    } else if (analytics.averageAccuracy >= 65) {
      insights.push(
        'Good accuracy. Reviewing experiment theory before conducting each lab session could push your scores higher.'
      );
    } else {
      insights.push(
        'Your accuracy needs improvement. Focus on reading the hints carefully and re-attempting steps where you scored low.'
      );
    }

    // ── Consistency Analysis ──────────────────────────────────────────────────
    const activeDays = analytics.weeklyActivity.filter((d) => d > 0).length;
    if (activeDays >= 5) {
      insights.push(
        'Excellent consistency — you have been active most days this week. Keep the momentum!'
      );
    } else if (activeDays >= 3) {
      insights.push(
        'Moderate activity frequency. Try to practise at least 5 days a week for optimal retention.'
      );
    } else {
      insights.push(
        'Low activity this week. Regular practice dramatically improves long-term physics understanding.'
      );
    }

    // ── Streak Recognition ────────────────────────────────────────────────────
    if (analytics.streakDays >= 7) {
      insights.push(
        `Impressive ${analytics.streakDays}-day learning streak! Consistency is the key to mastery.`
      );
    }

    // ── Conceptual Gap Detection ──────────────────────────────────────────────
    const weakConcepts = analytics.conceptualScores
      .filter((cs) => cs.score < 50)
      .map((cs) => cs.concept);

    if (weakConcepts.length > 0) {
      insights.push(
        `Conceptual gaps detected in: ${weakConcepts.join(', ')}. Focus on these topics in upcoming sessions.`
      );
    }

    // ── Time Management ───────────────────────────────────────────────────────
    const avgTimePerSession =
      analytics.totalSessions > 0
        ? analytics.totalTimeSpentMinutes / analytics.totalSessions
        : 0;

    if (avgTimePerSession > 0 && avgTimePerSession < 10) {
      insights.push(
        'Your average session duration is short. Consider spending more time exploring each experiment fully.'
      );
    } else if (avgTimePerSession > 60) {
      insights.push(
        'Long session durations recorded. Consider breaking sessions into focused 30-minute intervals for better retention.'
      );
    }

    // ── Progress Encouragement ────────────────────────────────────────────────
    if (analytics.completedSessions === 0) {
      insights.push(
        'No completed experiments yet. Start with a beginner-level experiment to build confidence!'
      );
    }

    return insights.slice(0, 5); // Return top 5 most relevant insights
  }

  /**
   * Generate a personalised study recommendation path based on performance.
   */
  static generateStudyPath(
    completedCategories: string[],
    averageScore: number
  ): { recommended: string; reason: string }[] {
    const allCategories = [
      'mechanics',
      'optics',
      'thermodynamics',
      'electromagnetism',
      'waves',
      'modern_physics',
    ];

    const pending = allCategories.filter((c) => !completedCategories.includes(c));
    const recommendations: { recommended: string; reason: string }[] = [];

    // Suggest based on logical learning progression
    const progressionMap: Record<string, string> = {
      mechanics: 'Foundation for all physics — start here.',
      waves: 'Builds on motion concepts from mechanics.',
      optics: 'Light is a wave — connect optics after waves.',
      thermodynamics: 'Explores energy transfer — complements mechanics.',
      electromagnetism: 'Core for technology and electronics.',
      modern_physics: 'Advanced — builds on all prior categories.',
    };

    pending.slice(0, 3).forEach((cat) => {
      recommendations.push({
        recommended: cat,
        reason: progressionMap[cat] || 'Expands your physics knowledge base.',
      });
    });

    if (averageScore < 60 && completedCategories.length > 0) {
      recommendations.unshift({
        recommended: completedCategories[completedCategories.length - 1],
        reason: 'Your recent scores suggest revisiting this topic for consolidation.',
      });
    }

    return recommendations;
  }

  /**
   * Compute AI-based risk score per student for educator alerts.
   */
  static computeRiskScore(
    averageAccuracy: number,
    engagementScore: number,
    daysSinceLastActive: number
  ): { level: 'low' | 'medium' | 'high'; score: number } {
    let score = 0;

    if (averageAccuracy < 40) score += 40;
    else if (averageAccuracy < 60) score += 20;

    if (engagementScore < 30) score += 30;
    else if (engagementScore < 50) score += 15;

    if (daysSinceLastActive > 14) score += 30;
    else if (daysSinceLastActive > 7) score += 15;

    const level: 'low' | 'medium' | 'high' =
      score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

    return { level, score: Math.min(100, score) };
  }
}
