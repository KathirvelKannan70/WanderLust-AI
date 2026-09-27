import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ItineraryView } from './components/ItineraryView';
import { RefinementBar } from './components/RefinementBar';
import { BudgetOverview } from './components/BudgetOverview';
import { PackingChecklist } from './components/PackingChecklist';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SavedTripsModal } from './components/SavedTripsModal';
import { fetchItinerary, fetchRefineItinerary } from './lib/api';
import type { ApiResponse } from './lib/api';
import type { Itinerary, TravelPreferences } from './types/itinerary';
import { getSavedTrips, saveTrip, deleteSavedTrip } from './lib/storage';
import type { SavedTrip } from './lib/storage';
import { exportToJson, exportToMarkdown, triggerPrintPdf } from './lib/exportUtils';
import { Download, FileText, Printer, Sparkles } from 'lucide-react';

export function App() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<ApiResponse['error'] | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({ online: true, hasApiKey: false });
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<{ prompt: string; prefs: TravelPreferences; mode?: string } | null>(null);

  // Stale Response Guard: Request Sequence Tracker
  const requestId = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSavedTrips(getSavedTrips());

    // Check server status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({ online: true, hasApiKey: data.hasApiKey });
      })
      .catch(() => {
        setApiStatus({ online: false, hasApiKey: false });
      });
  }, []);

  const handleGenerateItinerary = async (
    prompt: string,
    preferences: TravelPreferences,
    testFailureMode?: string
  ) => {
    // 1. Increment request sequence tracker
    const currentId = ++requestId.current;

    // 2. Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setLastSubmittedPrompt({ prompt, prefs: preferences, mode: testFailureMode });

    const response = await fetchItinerary({
      prompt,
      preferences,
      testFailureMode,
      signal: abortControllerRef.current.signal,
    });

    // 3. Stale response guard: Ignore if a newer request was initiated
    if (currentId !== requestId.current) {
      console.log(`⚠️ Stale request #${currentId} ignored because newer request #${requestId.current} is active.`);
      return;
    }

    setIsLoading(false);

    if (response.success && response.data) {
      setItinerary(response.data);
      setError(null);
    } else {
      setError(response.error);
    }
  };

  const handleRefineItinerary = async (instruction: string) => {
    if (!itinerary || isRefining) return;
    setIsRefining(true);

    const response = await fetchRefineItinerary(itinerary, instruction);
    setIsRefining(false);

    if (response.success && response.data) {
      setItinerary(response.data);
    } else if (response.error) {
      alert(`Realtime refinement failed: ${response.error.message}`);
    }
  };

  const handleSaveSession = () => {
    if (!itinerary) return;
    const updated = saveTrip(itinerary);
    setSavedTrips(updated);
  };

  const handleDeleteSavedTrip = (id: string) => {
    const updated = deleteSavedTrip(id);
    setSavedTrips(updated);
  };

  const isCurrentTripSaved = Boolean(
    itinerary && savedTrips.some((t) => t.itinerary.tripTitle === itinerary.tripTitle)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header
        savedTripsCount={savedTrips.length}
        onOpenSavedTrips={() => setIsSavedModalOpen(true)}
        onNewTrip={() => {
          setItinerary(null);
          setError(null);
        }}
        apiStatus={apiStatus}
      />

      <main className="flex-1">
        {/* Main Prompt Input Section */}
        <PromptInput
          onSubmit={handleGenerateItinerary}
          isLoading={isLoading}
        />

        {/* Loading State */}
        {isLoading && (
          <LoadingState
            onCancel={() => {
              requestId.current++;
              if (abortControllerRef.current) abortControllerRef.current.abort();
              setIsLoading(false);
            }}
          />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState
            error={error}
            onRetry={() => {
              if (lastSubmittedPrompt) {
                handleGenerateItinerary(
                  lastSubmittedPrompt.prompt,
                  lastSubmittedPrompt.prefs,
                  lastSubmittedPrompt.mode
                );
              }
            }}
          />
        )}

        {/* Generated Interactive Itinerary */}
        {itinerary && !isLoading && !error && (
          <div className="animate-fade-in">
            
            {/* Interactive Refinement Loop */}
            <RefinementBar
              onRefine={handleRefineItinerary}
              isRefining={isRefining}
            />

            {/* Export Bar */}
            <div className="w-full max-w-5xl mx-auto px-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Realtime AI Structured Itinerary</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportToJson(itinerary)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={() => exportToMarkdown(itinerary)}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Markdown</span>
                </button>

                <button
                  onClick={triggerPrintPdf}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Core Itinerary Component */}
            <ItineraryView
              itinerary={itinerary}
              onUpdateItinerary={setItinerary}
              onSaveSession={handleSaveSession}
              isSaved={isCurrentTripSaved}
            />

            {/* Extra Blocks: Budget Overview & Packing List */}
            <BudgetOverview itinerary={itinerary} />
            <PackingChecklist initialPackingList={itinerary.packingList} />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <p>WanderLust AI Trip Planner • Flam Frontend Internship Assignment Submission</p>
      </footer>

      {/* Saved Trips Modal */}
      <SavedTripsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedTrips={savedTrips}
        onSelectTrip={(selected) => {
          setItinerary(selected);
          setError(null);
        }}
        onDeleteTrip={handleDeleteSavedTrip}
      />

    </div>
  );
}

export default App;
