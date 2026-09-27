import React from 'react';
import { Compass, Sparkles, Bookmark, RefreshCw, Github } from 'lucide-react';

interface HeaderProps {
  savedTripsCount: number;
  onOpenSavedTrips: () => void;
  onNewTrip: () => void;
  apiStatus: { online: boolean; hasApiKey: boolean };
}

export const Header: React.FC<HeaderProps> = ({
  savedTripsCount,
  onOpenSavedTrips,
  onNewTrip,
  apiStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 backdrop-blur-md bg-slate-950/80 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={onNewTrip}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                WanderLust<span className="text-indigo-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                Trip Planner
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Structured AI Itinerary Generator</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* API Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${apiStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-slate-300">
              {apiStatus.hasApiKey ? 'Gemini 2.5 Flash' : 'Smart Mock Mode'}
            </span>
          </div>

          {/* New Trip Button */}
          <button
            onClick={onNewTrip}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          {/* Saved Trips Button */}
          <button
            onClick={onOpenSavedTrips}
            className="relative flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Trips</span>
            {savedTripsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-white text-indigo-700 text-[10px] font-extrabold rounded-full">
                {savedTripsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
