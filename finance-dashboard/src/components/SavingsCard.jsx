import React from 'react';

function SavingsCard({ title, current, target, currency = '$' }) {
  const percentage = (current / target) * 100;
  const remaining = target - current;

  return (
    <div className="glass-panel p-8 hover-lift">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Savings Goal</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-blue-500">
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200/50 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-brand-500 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTAgNDBMNDAgME0tMTAgMTBMMTAgLTBNMTAgNTBMNTAgMTAiLz48L2c+PC9zdmc+')] opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-center">
        <div className="bg-white/40 rounded-xl p-4 border border-white/50 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Current</p>
          <p className="text-2xl font-bold text-brand-600">
            {currency}{current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white/30 rounded-xl p-4 border border-white/40 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Target</p>
          <p className="text-2xl font-bold text-gray-800">
            {currency}{target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Remaining */}
      <div className="pt-5 border-t border-gray-200/50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">Remaining to Goal</span>
          <span className="text-xl font-extrabold text-emerald-500">
            {currency}{Math.max(0, remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SavingsCard;
