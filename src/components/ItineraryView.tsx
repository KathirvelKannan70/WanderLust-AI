import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  CheckSquare, 
  Download, 
  Share2, 
  Layers,
  Lightbulb,
  Bookmark
} from 'lucide-react';
import { Itinerary, ItineraryStop } from '../types/itinerary';
import { formatCurrency } from '../lib/formatUtils';
import { DayCard } from './DayCard';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onUpdateItinerary: (newItinerary: Itinerary) => void;
  onSaveSession: () => void;
  isSaved: boolean;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onUpdateItinerary,
  onSaveSession,
  isSaved,
}) => {
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');

  const grandTotalCost = itinerary.days.reduce(
    (sum, day) => sum + day.stops.reduce((sSum, stop) => sSum + (stop.estimatedCost || 0), 0),
    0
  );

  const totalStopsCount = itinerary.days.reduce((sum, d) => sum + d.stops.length, 0);
  const completedStopsCount = itinerary.days.reduce(
    (sum, d) => sum + d.stops.filter((s) => s.completed).length,
    0
  );

  // Stop Actions
  const handleToggleComplete = (dayNum: number, stopId: string) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          stops: day.stops.map((s) => (s.id === stopId ? { ...s, completed: !s.completed } : s)),
        };
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const handleDeleteStop = (dayNum: number, stopId: string) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          stops: day.stops.filter((s) => s.id !== stopId),
        };
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const handleMoveStopUp = (dayNum: number, stopId: string) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        const index = day.stops.findIndex((s) => s.id === stopId);
        if (index > 0) {
          const newStops = [...day.stops];
          const temp = newStops[index];
          newStops[index] = newStops[index - 1];
          newStops[index - 1] = temp;
          return { ...day, stops: newStops };
        }
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const handleMoveStopDown = (dayNum: number, stopId: string) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        const index = day.stops.findIndex((s) => s.id === stopId);
        if (index < day.stops.length - 1) {
          const newStops = [...day.stops];
          const temp = newStops[index];
          newStops[index] = newStops[index + 1];
          newStops[index + 1] = temp;
          return { ...day, stops: newStops };
        }
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const handleAddStop = (dayNum: number, newStopData: Partial<ItineraryStop>) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        const newStop: ItineraryStop = {
          id: `custom-stop-${Date.now()}`,
          time: newStopData.time || '12:00 PM',
          title: newStopData.title || 'New Activity',
          description: newStopData.description || '',
          category: newStopData.category || 'sights',
          location: newStopData.location || itinerary.destination,
          estimatedCost: newStopData.estimatedCost || 0,
          durationMinutes: newStopData.durationMinutes || 60,
          tips: newStopData.tips,
          mapQuery: newStopData.mapQuery,
          completed: false,
        };
        return { ...day, stops: [...day.stops, newStop] };
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const handleEditStop = (dayNum: number, updatedStop: ItineraryStop) => {
    const updated = { ...itinerary };
    updated.days = updated.days.map((day) => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          stops: day.stops.map((s) => (s.id === updatedStop.id ? updatedStop : s)),
        };
      }
      return day;
    });
    onUpdateItinerary(updated);
  };

  const displayedDays = activeTab === 'all' 
    ? itinerary.days 
    : itinerary.days.filter((d) => d.dayNumber === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12">
      
      {/* Trip Overview Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl mb-8 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 mb-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{itinerary.destination}</span>
              <span>•</span>
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{itinerary.durationDays} Days</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {itinerary.tripTitle}
            </h1>
            
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {itinerary.summary}
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex flex-row md:flex-col justify-between md:justify-center items-end bg-slate-950/80 p-4 rounded-xl border border-slate-800 gap-4 min-w-[200px]">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Est. Total Budget</span>
              <span className="text-2xl font-extrabold text-emerald-400">
                {formatCurrency(grandTotalCost, itinerary.currency)}
              </span>
            </div>

            <button
              onClick={onSaveSession}
              className={`w-full flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isSaved 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Trip Saved ✓' : 'Save Trip Session'}</span>
            </button>
          </div>

        </div>

        {/* Travel Tips Banner */}
        {itinerary.travelTips && itinerary.travelTips.length > 0 && (
          <div className="mt-4 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>AI Local Insider Advice:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {itinerary.travelTips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Day Tabs Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All {itinerary.durationDays} Days ({totalStopsCount} Stops)
        </button>

        {itinerary.days.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveTab(day.dayNumber)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === day.dayNumber
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full text-indigo-300">
              {day.stops.length}
            </span>
          </button>
        ))}
      </div>

      {/* Displayed Days */}
      <div className="space-y-6">
        {displayedDays.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            currency={itinerary.currency}
            onToggleComplete={handleToggleComplete}
            onDeleteStop={handleDeleteStop}
            onMoveStopUp={handleMoveStopUp}
            onMoveStopDown={handleMoveStopDown}
            onAddStop={handleAddStop}
            onEditStop={handleEditStop}
          />
        ))}
      </div>

    </div>
  );
};
