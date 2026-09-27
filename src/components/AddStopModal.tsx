import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { ItineraryStop, ActivityCategory } from '../types/itinerary';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stop: Partial<ItineraryStop>) => void;
  initialData?: ItineraryStop | null;
  dayNumber: number;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  dayNumber,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [category, setCategory] = useState<ActivityCategory>('sights');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [tips, setTips] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTime(initialData.time);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setLocation(initialData.location);
      setEstimatedCost(initialData.estimatedCost);
      setDurationMinutes(initialData.durationMinutes);
      setTips(initialData.tips || '');
    } else {
      setTitle('');
      setTime('10:00 AM');
      setCategory('sights');
      setDescription('');
      setLocation('');
      setEstimatedCost(0);
      setDurationMinutes(60);
      setTips('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData ? initialData.id : undefined,
      title,
      time,
      category,
      description,
      location,
      estimatedCost: Number(estimatedCost),
      durationMinutes: Number(durationMinutes),
      tips,
      mapQuery: `${title} ${location}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {initialData ? 'Edit Stop' : `Add Custom Stop to Day ${dayNumber}`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Stop Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Senso-ji Temple"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 09:30 AM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
              >
                <option value="sights">📷 Sights & Culture</option>
                <option value="food">🍜 Food & Dining</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="transport">🚌 Transport</option>
                <option value="nature">🌿 Nature & Outdoors</option>
                <option value="nightlife">🌙 Nightlife</option>
                <option value="accommodation">🏨 Accommodation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Estimated Cost</label>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Location / Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Asakusa, Taito City, Tokyo"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about what to see or do here..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Insider Tip (Optional)</label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="e.g. Buy ticket online to skip the main queue"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-semibold rounded-lg hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Add Stop'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
