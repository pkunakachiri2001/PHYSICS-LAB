import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Target, BookOpen, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI } from '../../services/api';
import { Analytics } from '../../types';

const riskColors: Record<string, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

const riskBg: Record<string, string> = {
  low: 'bg-emerald-500/10 border-emerald-500/20',
  medium: 'bg-amber-500/10 border-amber-500/20',
  high: 'bg-red-500/10 border-red-500/20',
};

const StudentDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!studentId) return;
      try {
        const res = await analyticsAPI.getStudentAnalytics(studentId);
        setAnalytics(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [studentId]);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading student profile..." />;

  // Narrowed student object (populated by backend)
  const student = analytics?.student && typeof analytics.student === 'object' ? analytics.student : null;

  const radarData =
    analytics?.conceptualScores.map((c) => ({
      concept: c.concept,
      score: c.score,
    })) || [];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <PageLayout
      title={student ? `${student.firstName} ${student.lastName}` : 'Student Detail'}
      subtitle={student ? `${student.email} · ${student.classGroup || 'No Group'}` : ''}
      actions={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-slate-800 text-slate-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
      }
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Avg Score"
          value={analytics?.averageScore?.toFixed(1) || '—'}
          icon={<TrendingUp size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${analytics?.averageAccuracy?.toFixed(1) || 0}%`}
          icon={<Target size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
        <StatCard
          title="Engagement"
          value={analytics?.engagementScore?.toFixed(0) || '—'}
          icon={<BookOpen size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="Streak"
          value={`${analytics?.streakDays || 0}d`}
          icon={<Clock size={22} className="text-amber-400" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Risk Level */}
        <div
          className={`rounded-2xl border p-6 flex flex-col gap-4 ${
            analytics?.riskLevel ? riskBg[analytics.riskLevel] : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={20}
              className={analytics?.riskLevel ? riskColors[analytics.riskLevel] : 'text-slate-400'}
            />
            <span className="text-slate-300 text-sm font-semibold">Risk Assessment</span>
          </div>
          <div>
            <span
              className={`text-3xl font-bold capitalize ${
                analytics?.riskLevel ? riskColors[analytics.riskLevel] : 'text-slate-400'
              }`}
            >
              {analytics?.riskLevel || '—'}
            </span>
            <p className="text-slate-500 text-xs mt-1">Overall learning risk level</p>
          </div>
          <div className="mt-2 space-y-1">
            {[
              { label: 'Avg Score', val: analytics?.averageScore?.toFixed(1) },
              { label: 'Accuracy', val: `${analytics?.averageAccuracy?.toFixed(1)}%` },
              { label: 'Sessions', val: analytics?.totalSessions },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-slate-300 text-sm font-semibold mb-4">Weekly Activity</h3>
          <div className="flex items-end gap-2 h-24">
            {(analytics?.weeklyActivity || Array(7).fill(0)).map((val: number, i: number) => {
              const max = Math.max(...(analytics?.weeklyActivity || [1]));
              const h = max > 0 ? (val / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className="w-full rounded-t bg-violet-500/60"
                      style={{ height: `${h}%`, minHeight: val > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-slate-600 text-xs">{weekDays[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conceptual Radar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-slate-300 text-sm font-semibold mb-4">Concept Mastery</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="concept" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-xs text-center mt-8">No concept data yet.</p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-500/10 rounded-xl">
            <Brain size={18} className="text-violet-400" />
          </div>
          <h3 className="text-slate-300 text-sm font-semibold">AI Insights</h3>
        </div>
        {analytics?.aiInsights?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.aiInsights.map((insight: string, i: number) => (
              <div key={i} className="flex gap-3 bg-slate-800/50 rounded-xl p-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                <p className="text-slate-400 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No AI insights generated yet — student needs more sessions.</p>
        )}
      </div>

      {/* Monthly Score Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-slate-300 text-sm font-semibold mb-4">Monthly Score Trend</h3>
        {analytics?.monthlyScores?.length ? (
          <div className="space-y-3">
            {analytics.monthlyScores.map((m: { month: string; avgScore: number; sessionsCount: number }, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-slate-500 text-xs w-20 shrink-0">{m.month}</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    style={{ width: `${Math.min(m.avgScore, 100)}%` }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-16 text-right">
                  {m.avgScore.toFixed(1)} · {m.sessionsCount}s
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No monthly data available.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default StudentDetail;
