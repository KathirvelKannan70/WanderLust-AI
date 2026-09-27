import React from 'react';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { SavedTrip } from '../lib/storage';
import { Itinerary } from '../types/itinerary';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: SavedTrip[];
  onSelectTrip: (itinerary: Itinerary) => void;
  onDeleteTrip: (id: string) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            <h3 className="text-lg font-bold text-white">Saved Trip Sessions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {savedTrips.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No saved trips found in local storage.</p>
              <p className="text-xs text-slate-500 mt-1">Generate an itinerary and click "Save Trip Session" to store it here.</p>
            </div>
          ) : (
            savedTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex items-center justify-between gap-4 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="font-semibold text-indigo-400">{trip.itinerary.destination}</span>
                    <span>•</span>
                    <span>{trip.itinerary.durationDays} Days</span>
                    <span>•</span>
                    <span className="text-[10px] text-slate-500">{trip.savedAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 truncate">
                    {trip.itinerary.tripTitle}
                  </h4>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      onSelectTrip(trip.itinerary);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/20"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    title="Delete Saved Trip"
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
