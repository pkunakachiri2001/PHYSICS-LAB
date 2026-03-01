import React, { useEffect, useState } from 'react';
import { Search, Filter, FlaskConical } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import ExperimentCard from '../../components/common/ExperimentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { experimentsAPI, progressAPI } from '../../services/api';
import { Experiment, Progress } from '../../types';

const CATEGORIES = ['all', 'mechanics', 'optics', 'thermodynamics', 'electromagnetism', 'waves', 'modern_physics'];
const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const ExperimentLab: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category !== 'all') params.category = category;
        if (difficulty !== 'all') params.difficulty = difficulty;
        if (search) params.search = search;

        const [experimentsRes, progressRes] = await Promise.all([
          experimentsAPI.getAll(params),
          progressAPI.getMyProgress(),
        ]);
        setExperiments(experimentsRes.data.data.experiments);
        setTotal(experimentsRes.data.data.pagination.total);
        setProgress(progressRes.data.data.progress);
      } catch (err) {
        console.error('Failed to fetch experiments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [category, difficulty, search]);

  const getProgressForExperiment = (experimentId: string) => {
    if (!progress) return undefined;
    return progress.experimentProgress.find((ep) => {
      const exp = ep.experiment as { _id: string } | string;
      return typeof exp === 'string' ? exp === experimentId : exp._id === experimentId;
    });
  };

  return (
    <PageLayout
      title="Physics Experiment Library"
      subtitle={`${total} experiments available — select one to launch your AR session`}
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-500 flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Experiments Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner message="Loading experiments..." />
        </div>
      ) : experiments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {experiments.map((experiment) => {
            const expProgress = getProgressForExperiment(experiment._id);
            return (
              <ExperimentCard
                key={experiment._id}
                experiment={experiment}
                completionStatus={expProgress?.completionStatus}
                bestScore={expProgress?.bestScore}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
            <FlaskConical size={36} className="text-slate-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No experiments found</h3>
          <p className="text-slate-500 text-sm max-w-xs">
            {search || category !== 'all' || difficulty !== 'all'
              ? 'Try adjusting your search filters.'
              : 'No experiments have been added yet. Check back soon!'}
          </p>
        </div>
      )}
    </PageLayout>
  );
};

export default ExperimentLab;
