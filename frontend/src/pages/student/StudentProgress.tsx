import React, { useEffect, useState } from 'react';
import { Award, TrendingUp, Star, CheckCircle2, Circle } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PerformanceChart } from '../../components/charts/DashboardCharts';
import { progressAPI, analyticsAPI } from '../../services/api';
import { Progress, Analytics, ProgressEntry, Experiment } from '../../types';

const statusColors: Record<string, string> = {
  mastered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  not_started: 'bg-slate-700 text-slate-500 border-slate-600',
};

const StudentProgress: React.FC = () => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [progressRes, analyticsRes] = await Promise.all([
          progressAPI.getMyProgress().catch(() => null),
          analyticsAPI.getMyAnalytics().catch(() => null),
        ]);
        if (progressRes) setProgress(progressRes.data.data.progress);
        if (analyticsRes) setAnalytics(analyticsRes.data.data.analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading your progress..." />;

  return (
    <PageLayout title="My Learning Progress" subtitle="Track your experiment history, scores, and academic standing">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Overall Grade"
          value={progress?.overallGrade || 'N/A'}
          subtitle={`${progress?.overallPercent || 0}% overall`}
          icon={<Award size={22} className="text-amber-400" />}
          gradient="from-amber-500/10 to-yellow-500/10"
        />
        <StatCard
          title="Experience Points"
          value={(progress?.experiencePoints || 0).toLocaleString()}
          subtitle={`Level ${progress?.currentLevel || 1}`}
          icon={<Star size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Experiments Completed"
          value={
            progress?.experimentProgress.filter(
              (ep) => ep.completionStatus === 'completed' || ep.completionStatus === 'mastered'
            ).length || 0
          }
          subtitle={`of ${progress?.experimentProgress.length || 0} total`}
          icon={<CheckCircle2 size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="Average Score"
          value={`${analytics?.averageScore?.toFixed(1) || 0}`}
          subtitle="Across all sessions"
          icon={<TrendingUp size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
      </div>

      {/* Level Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold">Learner Level</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {(500 - ((progress?.experiencePoints || 0) % 500))} XP to next level
            </p>
          </div>
          <div className="bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl px-4 py-2 text-sm font-bold">
            Level {progress?.currentLevel || 1}
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
            style={{ width: `${((progress?.experiencePoints || 0) % 500) / 5}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>{(progress?.experiencePoints || 0) % 500} XP</span>
          <span>500 XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance over time */}
        <PerformanceChart data={analytics?.monthlyScores || []} />

        {/* Badges */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Badges Earned</h3>
          {progress?.badges && progress.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {progress.badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                >
                  <Award size={16} className="text-amber-400" />
                  <span className="text-slate-300">{badge}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                Complete experiments to earn badges!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Experiment Progress Table */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold">Experiment Progress</h3>
          <p className="text-slate-500 text-xs mt-0.5">All experiments and your current status</p>
        </div>

        {progress?.experimentProgress && progress.experimentProgress.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {progress.experimentProgress.map((entry: ProgressEntry, i) => {
              const exp = entry.experiment as Experiment | { title: string; category: string } | string;
              const title =
                typeof exp === 'string' ? 'Experiment' : (exp as { title: string }).title;
              const category =
                typeof exp === 'string'
                  ? ''
                  : (exp as { category: string }).category?.replace('_', ' ');

              return (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {entry.completionStatus === 'not_started' ? (
                      <Circle size={16} className="text-slate-600" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{title}</p>
                    <p className="text-slate-500 text-xs capitalize">{category}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center hidden sm:block">
                      <p className="text-white font-semibold">{entry.bestScore}</p>
                      <p className="text-slate-600">Best Score</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-white font-semibold">{entry.attempts}</p>
                      <p className="text-slate-600">Attempts</p>
                    </div>
                    <div className="text-center hidden lg:block">
                      <p className="text-white font-semibold">{entry.totalTimeMinutes}m</p>
                      <p className="text-slate-600">Time</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                        statusColors[entry.completionStatus]
                      }`}
                    >
                      {entry.completionStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">
              No experiment history yet. Start your first lab session!
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default StudentProgress;
