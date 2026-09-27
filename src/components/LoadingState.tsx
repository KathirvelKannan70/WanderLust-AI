import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, XCircle } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
}

const LOADING_STEPS = [
  "Connecting to Gemini 2.5 Flash LLM...",
  "Analyzing your travel preferences & destination...",
  "Curating authentic local food & landmark recommendations...",
  "Structuring day-by-day JSON schema with budget estimates...",
  "Running multi-stage Zod structural validation check...",
  "Optimizing daily travel route pacing..."
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl text-center relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/30 animate-spin" style={{ animationDuration: '6s' }}>
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Crafting Your Travel Experience
        </h2>

        {/* Step Progress Message */}
        <p className="text-sm font-semibold text-indigo-400 mt-3 h-6 transition-all duration-300">
          {LOADING_STEPS[currentStepIndex]}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Shimmer Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left opacity-60">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="h-4 w-1/3 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-2/3 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-1/2 bg-slate-800 rounded animate-shimmer" />
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="h-4 w-1/3 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-2/3 bg-slate-800 rounded animate-shimmer" />
            <div className="h-3 w-1/2 bg-slate-800 rounded animate-shimmer" />
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="mt-8">
            <button
              onClick={onCancel}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Request</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
