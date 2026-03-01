import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Activity, BarChart2, Brain, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI } from '../../services/api';
import { PlatformOverview } from '../../types';

const quickActions = [
  { label: 'Manage Users', path: '/admin/users', color: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-500/20', icon: <Users size={18} className="text-violet-400" /> },
  { label: 'Manage Experiments', path: '/admin/experiments', color: 'from-cyan-500/10 to-blue-500/10', border: 'border-cyan-500/20', icon: <BookOpen size={18} className="text-cyan-400" /> },
  { label: 'View Analytics', path: '/admin/analytics', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/20', icon: <BarChart2 size={18} className="text-emerald-400" /> },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await analyticsAPI.getPlatformOverview();
        setOverview(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading platform overview..." />;

  const trendData = overview?.monthlyTrend || [
    { month: 'Aug', sessions: 0, avgScore: 0 },
    { month: 'Sep', sessions: 0, avgScore: 0 },
    { month: 'Oct', sessions: 0, avgScore: 0 },
  ];

  return (
    <PageLayout
      title="Admin Dashboard"
      subtitle="Platform-wide operational overview and system health"
      actions={
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-sm">System Online</span>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          icon={<Users size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Total Educators"
          value={overview?.totalEducators || 0}
          icon={<Brain size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
        <StatCard
          title="Total Sessions"
          value={overview?.totalSessions?.toLocaleString() || 0}
          icon={<Activity size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="Active Experiments"
          value={overview?.activeExperiments || 0}
          icon={<BookOpen size={22} className="text-amber-400" />}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Platform Trend */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 text-sm font-semibold">Platform Activity Trend</h3>
            <span className="text-slate-600 text-xs">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#8b5cf6' }}
              />
              <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" fill="url(#grad1)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-slate-300 text-sm font-semibold">Platform Metrics</h3>
          {[
            { label: 'Avg Platform Score', value: `${overview?.avgPlatformScore?.toFixed(1) || '—'}` },
            { label: 'Avg Accuracy', value: `${overview?.avgAccuracy?.toFixed(1) || '—'}%` },
            { label: 'Completion Rate', value: `${overview?.completionRate?.toFixed(1) || '—'}%` },
            { label: 'High-Risk Students', value: overview?.highRiskCount || 0 },
            { label: 'Sessions Today', value: overview?.sessionsToday || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className="text-white text-sm font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {quickActions.map(({ label, path, color, border, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`rounded-2xl border bg-gradient-to-br ${color} ${border} p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform`}
          >
            <div className="p-3 bg-slate-900/60 rounded-xl">{icon}</div>
            <span className="text-slate-300 text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Recent System Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={16} className="text-slate-500" />
          <h3 className="text-slate-300 text-sm font-semibold">Recent Sessions</h3>
        </div>
        {overview?.recentSessions?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Student', 'Experiment', 'Score', 'Accuracy', 'Time', 'Status'].map((h) => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {overview.recentSessions.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 text-slate-300 text-sm">{s.student}</td>
                    <td className="px-3 py-3 text-slate-400 text-sm">{s.experiment}</td>
                    <td className="px-3 py-3 text-white text-sm font-medium">{s.score}</td>
                    <td className="px-3 py-3 text-slate-300 text-sm">{s.accuracy}%</td>
                    <td className="px-3 py-3 text-slate-500 text-xs">{s.time}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        s.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-6">No recent sessions on record.</p>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
