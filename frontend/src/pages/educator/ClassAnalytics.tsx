import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI } from '../../services/api';
import { ClassAnalytics, ClassStudentSummary } from '../../types';

const riskBadge: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ClassAnalyticsPage: React.FC = () => {
  const { classGroup = 'all' } = useParams<{ classGroup: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ClassAnalytics | null>(null);
  const [filtered, setFiltered] = useState<ClassStudentSummary[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await analyticsAPI.getClassAnalytics(classGroup);
        setData(res.data.data);
        setFiltered(res.data.data.students);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [classGroup]);

  useEffect(() => {
    if (!data) return;
    let result = data.students;
    if (search) {
      result = result.filter(
        (s) =>
          s.student.name.toLowerCase().includes(search.toLowerCase()) ||
          s.student.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter !== 'all') {
      result = result.filter((s) => s.riskLevel === filter);
    }
    setFiltered(result);
  }, [search, filter, data]);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading class analytics..." />;

  const summary = data?.classSummary;

  return (
    <PageLayout
      title={`Class Analytics — ${classGroup}`}
      subtitle={`${data?.totalStudents || 0} students · Real-time performance & engagement metrics`}
      actions={
        <button
          onClick={() => navigate('/educator')}
          className="flex items-center gap-2 bg-slate-800 text-slate-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Students"
          value={data?.totalStudents || 0}
          icon={<Users size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Class Avg Score"
          value={`${summary?.avgScore?.toFixed(1) || 0}`}
          icon={<TrendingUp size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${summary?.avgAccuracy?.toFixed(1) || 0}%`}
          icon={<Target size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="At-Risk Students"
          value={summary?.riskDistribution.high || 0}
          icon={<AlertTriangle size={22} className="text-red-400" />}
          gradient="from-red-500/10 to-rose-500/10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'medium', 'high'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : `${f} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Student', 'Avg Score', 'Accuracy', 'Engagement', 'Sessions', 'Grade', 'Last Active', 'Risk'].map((h) => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((s) => (
                <tr
                  key={s.student.id}
                  onClick={() => navigate(`/educator/student/${s.student.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-white text-sm font-medium">{s.student.name}</p>
                      <p className="text-slate-500 text-xs">{s.student.studentId || s.student.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-sm font-medium">{s.averageScore.toFixed(1)}</td>
                  <td className="px-5 py-4 text-slate-300 text-sm">{s.averageAccuracy.toFixed(1)}%</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                        <div
                          className="h-1.5 rounded-full bg-violet-400"
                          style={{ width: `${s.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{s.engagementScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-sm">{s.totalSessions}</td>
                  <td className="px-5 py-4 text-white text-sm font-bold">{s.overallGrade}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${riskBadge[s.riskLevel]}`}>
                      {s.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No students match your filter.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ClassAnalyticsPage;
