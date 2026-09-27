import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Edit2,
  Utensils,
  Camera,
  ShoppingBag,
  Bus,
  Bed,
  Trees,
  Moon
} from 'lucide-react';
import { ItineraryStop, ActivityCategory } from '../types/itinerary';
import { formatCurrency } from '../lib/formatUtils';

interface ActivityItemProps {
  stop: ItineraryStop;
  index: number;
  totalStops: number;
  currency: string;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (stop: ItineraryStop) => void;
}

export const getCategoryIcon = (category: ActivityCategory) => {
  switch (category) {
    case 'food':
      return <Utensils className="w-4 h-4 text-amber-400" />;
    case 'sights':
      return <Camera className="w-4 h-4 text-indigo-400" />;
    case 'shopping':
      return <ShoppingBag className="w-4 h-4 text-pink-400" />;
    case 'transport':
      return <Bus className="w-4 h-4 text-blue-400" />;
    case 'accommodation':
      return <Bed className="w-4 h-4 text-purple-400" />;
    case 'nature':
      return <Trees className="w-4 h-4 text-emerald-400" />;
    case 'nightlife':
      return <Moon className="w-4 h-4 text-violet-400" />;
    default:
      return <MapPin className="w-4 h-4 text-slate-400" />;
  }
};

export const getCategoryBadge = (category: ActivityCategory) => {
  const label = category.toUpperCase();
  switch (category) {
    case 'food':
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">{label}</span>;
    case 'sights':
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">{label}</span>;
    case 'shopping':
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-md">{label}</span>;
    case 'transport':
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">{label}</span>;
    case 'nature':
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">{label}</span>;
    default:
      return <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-md">{label}</span>;
  }
};

export const ActivityItem: React.FC<ActivityItemProps> = ({
  stop,
  index,
  totalStops,
  currency,
  onToggleComplete,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapQuery || `${stop.title} ${stop.location}`)}`;

  return (
    <div 
      className={`group rounded-xl border transition-all duration-200 overflow-hidden ${
        stop.completed 
          ? 'bg-slate-900/40 border-slate-800/60 opacity-70' 
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Main Bar */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        
        {/* Left Side: Checkbox & Category */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          
          <button
            onClick={() => onToggleComplete(stop.id)}
            title={stop.completed ? "Mark incomplete" : "Mark completed"}
            className="text-slate-500 hover:text-emerald-400 transition-colors focus:outline-none flex-shrink-0"
          >
            {stop.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            ) : (
              <Circle className="w-5 h-5 text-slate-600 hover:text-indigo-400" />
            )}
          </button>

          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(stop.category)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-semibold text-indigo-400 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{stop.time}</span>
              </span>
              {getCategoryBadge(stop.category)}
              {stop.estimatedCost > 0 && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  {formatCurrency(stop.estimatedCost, currency)}
                </span>
              )}
            </div>

            <h4 className={`text-sm sm:text-base font-bold mt-0.5 truncate ${stop.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {stop.title}
            </h4>
          </div>
        </div>

        {/* Right Side: Reorder & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          
          {/* Move Up/Down Controls */}
          <div className="flex flex-col sm:flex-row space-y-0.5 sm:space-y-0 sm:space-x-0.5">
            <button
              onClick={() => onMoveUp(stop.id)}
              disabled={index === 0}
              title="Move Up"
              className="p-1 text-slate-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-800 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown(stop.id)}
              disabled={index === totalStops - 1}
              title="Move Down"
              className="p-1 text-slate-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed rounded hover:bg-slate-800 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Edit */}
          <button
            onClick={() => onEdit(stop)}
            title="Edit Activity"
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(stop.id)}
            title="Remove Activity"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Show Less" : "Show Details"}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-3 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed">{stop.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Location: <strong className="text-slate-200">{stop.location}</strong></span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. Duration: <strong className="text-slate-200">{stop.durationMinutes} mins</strong></span>
            </div>
          </div>

          {stop.tips && (
            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-xs">
              💡 <strong>Insider Tip:</strong> {stop.tips}
            </div>
          )}

          <div className="pt-1 flex items-center justify-between">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
