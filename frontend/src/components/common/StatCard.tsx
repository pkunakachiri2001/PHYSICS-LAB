import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  gradient?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  gradient = 'from-slate-800 to-slate-900',
  onClick,
}) => {
  const TrendIcon =
    trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend === undefined
      ? ''
      : trend > 0
      ? 'text-emerald-400'
      : trend < 0
      ? 'text-red-400'
      : 'text-slate-400';

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-slate-800/50 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-slate-700' : ''
      } transition-all duration-200 shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white leading-none truncate">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
          {TrendIcon && trend !== undefined && trendLabel && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon size={14} />
              <span className="text-xs font-medium">
                {Math.abs(trend)}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
