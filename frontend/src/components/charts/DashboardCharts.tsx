import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts';

interface PerformanceChartProps {
  data: { month: string; avgScore?: number; averageScore?: number }[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => (
  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
    <h3 className="text-white font-semibold mb-1">Score Progression</h3>
    <p className="text-slate-500 text-xs mb-6">Monthly average experiment scores</p>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#22d3ee' }}
        />
        <Area
          type="monotone"
          dataKey="avgScore"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#scoreGrad)"
          name="Avg Score"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

interface WeeklyActivityChartProps {
  data: number[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  const chartData = DAYS.map((day, i) => ({ day, sessions: data[i] || 0 }));

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <h3 className="text-white font-semibold mb-1">Weekly Activity</h3>
      <p className="text-slate-500 text-xs mb-6">Sessions completed per day this week</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Bar dataKey="sessions" fill="#818cf8" radius={[4, 4, 0, 0]} name="Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ConceptRadarChartProps {
  data: { concept: string; score: number }[];
}

export const ConceptRadarChart: React.FC<ConceptRadarChartProps> = ({ data }) => (
  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
    <h3 className="text-white font-semibold mb-1">Conceptual Mastery</h3>
    <p className="text-slate-500 text-xs mb-4">Scores across physics concepts</p>
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1e293b" />
        <PolarAngleAxis tick={{ fill: '#64748b', fontSize: 11 }} dataKey="concept" />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#34d399"
          fill="#34d399"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 8,
          }}
          itemStyle={{ color: '#34d399' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);
