import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Zap, ChevronRight } from 'lucide-react';
import { Experiment } from '../../types';

interface ExperimentCardProps {
  experiment: Experiment;
  completionStatus?: string;
  bestScore?: number;
}

const categoryColors: Record<string, string> = {
  mechanics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  optics: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  thermodynamics: 'bg-red-500/20 text-red-400 border-red-500/30',
  electromagnetism: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  waves: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  modern_physics: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const difficultyColors: Record<string, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-red-400',
};

const difficultyStars: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  completionStatus,
  bestScore,
}) => {
  const navigate = useNavigate();
  const stars = difficultyStars[experiment.difficulty] || 1;

  return (
    <div
      onClick={() => navigate(`/student/experiments/${experiment._id}/ar`)}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
        <div className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">
          🔬
        </div>
        {completionStatus && (
          <div className="absolute top-3 right-3">
            {completionStatus === 'mastered' && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-1 rounded-full font-medium">
                Mastered
              </span>
            )}
            {completionStatus === 'completed' && (
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-1 rounded-full font-medium">
                Completed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`text-xs px-2 py-1 rounded-full border font-medium ${
              categoryColors[experiment.category] || 'bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            {experiment.category.replace('_', ' ')}
          </span>
          <div className={`flex items-center gap-0.5 ${difficultyColors[experiment.difficulty]}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star key={i} size={12} fill={i < stars ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>

        <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
          {experiment.title}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
          {experiment.description}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{experiment.estimatedDuration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={12} />
            <span>{experiment.maxScore} pts</span>
          </div>
          {bestScore !== undefined && (
            <span className="text-cyan-400 font-medium">Best: {bestScore}</span>
          )}
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-all duration-200 border border-slate-700 hover:border-cyan-500/40 group-hover:border-cyan-500/30">
          Launch AR Lab <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ExperimentCard;
