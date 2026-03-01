import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, TrendingUp, Clock,
  BookOpen, Target, Lightbulb, ChevronRight, Activity,
} from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PerformanceChart, WeeklyActivityChart, ConceptRadarChart } from '../../components/charts/DashboardCharts';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, experimentsAPI } from '../../services/api';
import { Analytics, Experiment } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentExperiments, setRecentExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, experimentsRes] = await Promise.all([
          analyticsAPI.getMyAnalytics(),
          experimentsAPI.getAll({ limit: 4 }),
        ]);
        setAnalytics(analyticsRes.data.data.analytics);
        setRecentExperiments(experimentsRes.data.data.experiments);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading your dashboard..." />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const riskColors: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  };

  return (
    <PageLayout
      title={`${greeting()}, ${user?.firstName || 'Student'} 👋`}
      subtitle={`${user?.institution || 'Smart AR Physics Lab'} • ${user?.classGroup || 'No class group'}`}
      actions={
        <button
          onClick={() => navigate('/student/experiments')}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <FlaskConical size={16} /> New Experiment
        </button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Average Score"
          value={`${analytics?.averageScore?.toFixed(1) || 0}`}
          subtitle="Across all experiments"
          icon={<Target size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
          trend={5}
          trendLabel="this month"
        />
        <StatCard
          title="Accuracy"
          value={`${analytics?.averageAccuracy?.toFixed(1) || 0}%`}
          subtitle="Experiment result accuracy"
          icon={<TrendingUp size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="Completed Sessions"
          value={analytics?.completedSessions || 0}
          subtitle="Total experiments done"
          icon={<FlaskConical size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Time Spent"
          value={`${analytics?.totalTimeSpentMinutes || 0} min`}
          subtitle="Total learning time"
          icon={<Clock size={22} className="text-amber-400" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      {/* Engagement & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Engagement Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Engagement Score</h3>
            <Activity size={18} className="text-slate-500" />
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black text-white">
              {analytics?.engagementScore || 0}
            </span>
            <span className="text-slate-500 text-sm mb-1">/100</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
              style={{ width: `${analytics?.engagementScore || 0}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Risk Level:</span>
            <span
              className={`text-xs font-semibold capitalize ${
                riskColors[analytics?.riskLevel || 'low']
              }`}
            >
              {analytics?.riskLevel || 'low'}
            </span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-400" />
            <h3 className="text-white font-semibold">AI Learning Insights</h3>
          </div>
          <div className="space-y-3">
            {analytics?.aiInsights && analytics.aiInsights.length > 0 ? (
              analytics.aiInsights.slice(0, 3).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{insight}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">
                  Complete your first experiment to unlock AI insights.
                </p>
                <button
                  onClick={() => navigate('/student/experiments')}
                  className="mt-3 text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 mx-auto"
                >
                  Start an experiment <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart data={analytics?.monthlyScores || []} />
        <WeeklyActivityChart data={analytics?.weeklyActivity || [0, 0, 0, 0, 0, 0, 0]} />
      </div>

      {/* Conceptual Radar + Recent Experiments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConceptRadarChart
          data={
            analytics?.conceptualScores?.map((cs) => ({
              concept: cs.concept,
              score: cs.score,
            })) || [
              { concept: 'Mechanics', score: 0 },
              { concept: 'Optics', score: 0 },
              { concept: 'Waves', score: 0 },
              { concept: 'Thermodynamics', score: 0 },
              { concept: 'Electromagnetism', score: 0 },
            ]
          }
        />

        {/* Recent Experiments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Available Experiments</h3>
            <button
              onClick={() => navigate('/student/experiments')}
              className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentExperiments.length > 0 ? (
              recentExperiments.map((exp) => (
                <div
                  key={exp._id}
                  onClick={() => navigate(`/student/experiments/${exp._id}/ar`)}
                  className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                    🔬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{exp.title}</p>
                    <p className="text-slate-500 text-xs capitalize">{exp.category.replace('_', ' ')} · {exp.difficulty}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0"
                  />
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">
                No experiments available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default StudentDashboard;
