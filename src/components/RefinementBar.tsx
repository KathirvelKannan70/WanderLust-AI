import React, { useState } from 'react';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface RefinementBarProps {
  onRefine: (instruction: string) => void;
  isRefining: boolean;
}

const QUICK_REFINEMENTS = [
  "🌱 Add more vegetarian/vegan lunch options",
  "🌿 Make Day 2 more relaxed with less walking",
  "💰 Reduce budget activities and find free entry spots",
  "🌙 Add nightlife & izakaya recommendations",
];

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isRefining }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    onRefine(instruction);
    setInstruction('');
  };

  const applyQuickRefinement = (text: string) => {
    const cleanText = text.replace(/^[^\w]+/, '').trim();
    onRefine(cleanText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 shadow-xl">
        
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 mb-2">
          <Wand2 className="w-4 h-4 text-purple-400" />
          <span>Interactive AI Refinement Loop: Modify Existing Itinerary</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRefining}
            placeholder="e.g. 'Swap Day 3 dinner to a traditional sushi spot' or 'Add a museum in the afternoon'..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm text-white bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 outline-none placeholder:text-slate-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!instruction.trim() || isRefining}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5 whitespace-nowrap"
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Apply Refinement</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Refinement Chips */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0">Quick Edits:</span>
          {QUICK_REFINEMENTS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRefining}
              onClick={() => applyQuickRefinement(q)}
              className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
