import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Terminal, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { ApiResponse } from '../lib/api';

interface ErrorStateProps {
  error: ApiResponse['error'];
  onRetry: () => void;
  onUseMockFallback: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onUseMockFallback }) => {
  const [showLogs, setShowLogs] = useState(false);

  if (!error) return null;

  const getErrorTypeBadge = () => {
    switch (error.type) {
      case 'malformed_json':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">Malformed JSON Syntax</span>;
      case 'wrong_shape':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Invalid Schema Shape</span>;
      case 'empty_response':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">Empty Model Output</span>;
      case 'timeout':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">Request Timeout</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">API Connection Error</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 animate-fade-in">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-red-500/30 bg-red-950/20 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex-shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-2">
              {getErrorTypeBadge()}
              <span className="text-xs text-slate-400">Error Handling Active</span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              AI Output Validation Failed
            </h3>

            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {error.message}
            </p>

            {/* Error Details */}
            {error.details && error.details.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-400 list-disc list-inside bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {error.details.map((detail, idx) => (
                  <li key={idx} className="leading-normal">{detail}</li>
                ))}
              </ul>
            )}

            {/* Dev Diagnostic Panel Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{showLogs ? 'Hide Technical Diagnostic Logs' : 'View Developer Diagnostic Logs & Raw Output'}</span>
                {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showLogs && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <div className="text-slate-500 mb-1">// Diagnostic Trace details</div>
                  <div>Error Type: <span className="text-red-400">{error.type}</span></div>
                  <div>Message: <span className="text-amber-300">{error.message}</span></div>
                  {error.rawSnippet && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <div className="text-slate-500 mb-1">// Raw Output Received:</div>
                      <pre className="text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {error.rawSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onRetry}
                className="w-full sm:w-auto px-5 py-2.5 font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Request with AI</span>
              </button>

              <button
                onClick={onUseMockFallback}
                className="w-full sm:w-auto px-5 py-2.5 font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Load Verified Demo Itinerary</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
