import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BarChart3, TrendingUp, AlertTriangle,
  ChevronRight, BookOpen,
} from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClassAnalytics } from '../../types';

const riskBadge: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const EducatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default to educator's class group or 'all'
  const classGroup = user?.classGroup || 'all';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes] = await Promise.all([
          analyticsAPI.getClassAnalytics(classGroup),
        ]);
        setClassAnalytics(classRes.data.data);
      } catch (err) {
        console.error('Failed to fetch educator dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [classGroup]);

  if (isLoading) return <LoadingSpinner fullScreen message="Loading class data..." />;

  const summary = classAnalytics?.classSummary;
  const atRisk = classAnalytics?.students.filter((s) => s.riskLevel === 'high').length || 0;

  return (
    <PageLayout
      title="Educator Dashboard"
      subtitle={`Class: ${classGroup} · ${classAnalytics?.totalStudents || 0} enrolled students`}
      actions={
        <button
          onClick={() => navigate(`/educator/class/${classGroup}`)}
          className="flex items-center gap-2 bg-violet-500/20 text-violet-400 border border-violet-500/30 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-500/30 transition-all"
        >
          <BarChart3 size={16} /> Full Class Analytics
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Students"
          value={classAnalytics?.totalStudents || 0}
          subtitle="Enrolled in your class"
          icon={<Users size={22} className="text-violet-400" />}
          gradient="from-violet-500/10 to-purple-500/10"
        />
        <StatCard
          title="Class Avg Score"
          value={summary?.avgScore?.toFixed(1) || '0'}
          subtitle="Mean experiment score"
          icon={<TrendingUp size={22} className="text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${summary?.avgAccuracy?.toFixed(1) || 0}%`}
          subtitle="Experiment result accuracy"
          icon={<BarChart3 size={22} className="text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          title="At-Risk Students"
          value={atRisk}
          subtitle="Require immediate attention"
          icon={<AlertTriangle size={22} className="text-red-400" />}
          gradient="from-red-500/10 to-rose-500/10"
        />
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Risk Distribution</h3>
          {summary?.riskDistribution ? (
            <div className="space-y-4">
              {[
                { label: 'Low Risk', key: 'low', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'Medium Risk', key: 'medium', color: 'bg-amber-500', textColor: 'text-amber-400' },
                { label: 'High Risk', key: 'high', color: 'bg-red-500', textColor: 'text-red-400' },
              ].map(({ label, key, color, textColor }) => {
                const count = summary.riskDistribution[key as keyof typeof summary.riskDistribution];
                const pct = classAnalytics?.totalStudents
                  ? Math.round((count / classAnalytics.totalStudents) * 100)
                  : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={textColor}>{label}</span>
                      <span className="text-slate-400">{count} students ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No data available.</p>
          )}
        </div>

        {/* Engagement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Average Engagement</h3>
          <div className="flex flex-col items-center justify-center h-32">
            <span className="text-5xl font-black text-white">
              {summary?.avgEngagement?.toFixed(0) || 0}
            </span>
            <span className="text-slate-500 text-sm mt-1">/ 100</span>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                style={{ width: `${summary?.avgEngagement || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Class overview card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'View Full Class Report', icon: <BarChart3 size={16} />, path: `/educator/class/${classGroup}` },
              { label: 'Manage Experiments', icon: <BookOpen size={16} />, path: '/admin/experiments' },
              { label: 'Student List', icon: <Users size={16} />, path: '#' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white text-sm transition-all group"
              >
                {action.icon}
                <span className="flex-1 text-left">{action.label}</span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold">Student Overview</h3>
          <button
            onClick={() => navigate(`/educator/class/${classGroup}`)}
            className="text-violet-400 text-xs hover:text-violet-300 flex items-center gap-1"
          >
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Student', 'Avg Score', 'Accuracy', 'Engagement', 'Grade', 'Risk'].map((h) => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {classAnalytics?.students.slice(0, 8).map((s) => (
                <tr
                  key={s.student.id}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/educator/student/${s.student.id}`)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white text-sm font-medium">{s.student.name}</p>
                      <p className="text-slate-500 text-xs">{s.student.studentId || s.student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{s.averageScore.toFixed(1)}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{s.averageAccuracy.toFixed(1)}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full">
                        <div
                          className="h-1.5 rounded-full bg-violet-400 transition-all"
                          style={{ width: `${s.engagementScore}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{s.engagementScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">{s.overallGrade}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${riskBadge[s.riskLevel]}`}>
                      {s.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!classAnalytics?.students || classAnalytics.students.length === 0) && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No students found in this class.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EducatorDashboard;
