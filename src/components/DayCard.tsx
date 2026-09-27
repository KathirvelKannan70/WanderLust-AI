import React, { useState } from 'react';
import { Calendar, Plus, Sparkles, DollarSign } from 'lucide-react';
import { ItineraryDay, ItineraryStop } from '../types/itinerary';
import { formatCurrency } from '../lib/formatUtils';
import { ActivityItem } from './ActivityItem';
import { AddStopModal } from './AddStopModal';

interface DayCardProps {
  day: ItineraryDay;
  currency: string;
  onToggleComplete: (dayNum: number, stopId: string) => void;
  onDeleteStop: (dayNum: number, stopId: string) => void;
  onMoveStopUp: (dayNum: number, stopId: string) => void;
  onMoveStopDown: (dayNum: number, stopId: string) => void;
  onAddStop: (dayNum: number, newStop: Partial<ItineraryStop>) => void;
  onEditStop: (dayNum: number, updatedStop: ItineraryStop) => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  currency,
  onToggleComplete,
  onDeleteStop,
  onMoveStopUp,
  onMoveStopDown,
  onAddStop,
  onEditStop,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<ItineraryStop | null>(null);

  const dayTotalCost = day.stops.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
  const completedCount = day.stops.filter((s) => s.completed).length;

  const handleOpenAddModal = () => {
    setEditingStop(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stop: ItineraryStop) => {
    setEditingStop(stop);
    setIsModalOpen(true);
  };

  const handleSaveModal = (stopData: Partial<ItineraryStop>) => {
    if (editingStop) {
      onEditStop(day.dayNumber, { ...editingStop, ...stopData } as ItineraryStop);
    } else {
      onAddStop(day.dayNumber, stopData);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 relative overflow-hidden border border-slate-800">
      
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800/80 gap-3">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-indigo-500/20">
            D{day.dayNumber}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {day.theme || `Day ${day.dayNumber}`}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {completedCount}/{day.stops.length} Done
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {day.title}
            </h3>
          </div>
        </div>

        {/* Day Stats & Add Button */}
        <div className="flex items-center justify-between sm:justify-end space-x-3">
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">Day Budget</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(dayTotalCost, currency)}
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stop</span>
          </button>
        </div>

      </div>

      {/* Stops Timeline */}
      <div className="space-y-3 relative">
        {day.stops.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">No stops scheduled for this day yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:underline"
            >
              + Add a custom activity
            </button>
          </div>
        ) : (
          day.stops.map((stop, idx) => (
            <ActivityItem
              key={stop.id}
              stop={stop}
              index={idx}
              totalStops={day.stops.length}
              currency={currency}
              onToggleComplete={(id) => onToggleComplete(day.dayNumber, id)}
              onDelete={(id) => onDeleteStop(day.dayNumber, id)}
              onMoveUp={(id) => onMoveStopUp(day.dayNumber, id)}
              onMoveDown={(id) => onMoveStopDown(day.dayNumber, id)}
              onEdit={handleOpenEditModal}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <AddStopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingStop}
        dayNumber={day.dayNumber}
      />

    </div>
  );
};
