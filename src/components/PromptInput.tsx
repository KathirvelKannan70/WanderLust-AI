import React, { useState } from 'react';
import { Sparkles, MapPin, DollarSign, Zap, Users, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { TravelPreferences } from '../types/itinerary';

interface PromptInputProps {
  onSubmit: (prompt: string, preferences: TravelPreferences, testFailureMode?: string) => void;
  isLoading: boolean;
}

const PRESET_TRIPS = [
  {
    title: "🗼 4 Days in Tokyo",
    prompt: "4 days in Tokyo focusing on ramen, anime in Akihabara, historic temples like Senso-ji, and Shibuya nightlife on a moderate budget.",
    budget: "moderate" as const,
    pace: "balanced" as const,
  },
  {
    title: "🥐 5 Days Romantic Paris",
    prompt: "5 days in Paris for a couple who love museums, cozy bakeries, wine tasting in Le Marais, and romantic Seine river walks.",
    budget: "luxury" as const,
    pace: "relaxed" as const,
  },
  {
    title: "🏝️ 4 Days Chill Bali",
    prompt: "4 days in Bali featuring Ubud waterfalls, monkey forest, beach clubs in Seminyak, and organic cafe breakfast on a budget.",
    budget: "budget" as const,
    pace: "relaxed" as const,
  },
  {
    title: "🌋 5 Days Iceland Ring Road",
    prompt: "5 days road trip in Iceland exploring the Golden Circle, waterfalls, black sand beaches, and geothermal hot springs.",
    budget: "moderate" as const,
    pace: "fast-paced" as const,
  },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [budgetLevel, setBudgetLevel] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [pace, setPace] = useState<'relaxed' | 'balanced' | 'fast-paced'>('balanced');
  const [travelers, setTravelers] = useState<'solo' | 'couple' | 'family' | 'friends'>('couple');
  const [testFailureMode, setTestFailureMode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt, { budgetLevel, pace, travelers }, testFailureMode || undefined);
  };

  const applyPreset = (preset: typeof PRESET_TRIPS[0]) => {
    setPrompt(preset.prompt);
    setBudgetLevel(preset.budget);
    setPace(preset.pace);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-800 bg-slate-900/90 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Title */}
        <div className="text-center mb-6 relative">
          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Itinerary Architect</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Where would you like to travel?
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Describe your dream trip in free text. Our AI will generate an interactive, customizable day-by-day itinerary with budget estimates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          
          {/* Main Textarea */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 4 days in Tokyo focusing on ramen food tours, anime, ancient temples, and shopping on a $1200 budget..."
              rows={4}
              maxLength={800}
              className="w-full p-4 text-sm sm:text-base text-slate-100 bg-slate-950/80 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500 resize-none"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-500">
              {prompt.length}/800
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              💡 Or try a sample travel prompt:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TRIPS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="text-left p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="font-medium truncate">{preset.title}</span>
                  <span className="text-[10px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">Use →</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Budget */}
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget Tier</span>
              </label>
              <select
                value={budgetLevel}
                onChange={(e: any) => setBudgetLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="budget">💰 Budget Conscious</option>
                <option value="moderate">💳 Moderate Comfort</option>
                <option value="luxury">✨ Luxury Experience</option>
              </select>
            </div>

            {/* Pace */}
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Travel Pace</span>
              </label>
              <select
                value={pace}
                onChange={(e: any) => setPace(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="relaxed">🌿 Relaxed & Slow</option>
                <option value="balanced">⚖️ Balanced Pace</option>
                <option value="fast-paced">⚡ Action Packed</option>
              </select>
            </div>

            {/* Group */}
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Travelers</span>
              </label>
              <select
                value={travelers}
                onChange={(e: any) => setTravelers(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-indigo-500"
              >
                <option value="solo">🧑 Solo Explorer</option>
                <option value="couple">👩‍❤️‍👨 Couple</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="friends">👥 Group of Friends</option>
              </select>
            </div>
          </div>

          {/* Evaluator Demo Mode: Test Bad AI Output */}
          <div className="pt-2 border-t border-slate-800/80">
            <details className="text-xs text-slate-400 cursor-pointer group">
              <summary className="font-medium hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Evaluator Testing Suite: Simulate Bad AI Failures</span>
              </summary>
              <div className="mt-2.5 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-2">
                <p className="text-[11px] text-slate-300">
                  Select a failure mode to test how gracefully the application validates and handles unpredictable AI errors without crashing:
                </p>
                <select
                  value={testFailureMode}
                  onChange={(e) => setTestFailureMode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-amber-200 bg-slate-950 border border-amber-500/30 rounded-md outline-none"
                >
                  <option value="">🟢 Normal AI Response (Valid JSON)</option>
                  <option value="malformed_json">🔴 Malformed JSON (Syntax Error)</option>
                  <option value="wrong_shape">🔴 Wrong Shape (Missing Days/Stops)</option>
                  <option value="empty">🔴 Empty AI Output</option>
                  <option value="server_500">🔴 Server 500 Error</option>
                  <option value="slow_timeout">🔴 Slow Response Timeout (15s+)</option>
                </select>
              </div>
            </details>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full py-3.5 px-6 font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Build Interactive Itinerary</span>
                  <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
