import React, { useState } from 'react';
import { Briefcase, CheckSquare, Square, Plus } from 'lucide-react';
import { PackingCategory } from '../types/itinerary';

interface PackingChecklistProps {
  initialPackingList: PackingCategory[];
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({ initialPackingList }) => {
  const [packingList, setPackingList] = useState(initialPackingList || []);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [newItemText, setNewItemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  const toggleCheck = (itemKey: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || packingList.length === 0) return;

    const updated = [...packingList];
    updated[selectedCategory].items.push(newItemText.trim());
    setPackingList(updated);
    setNewItemText('');
  };

  if (!packingList || packingList.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Smart Packing Checklist</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packingList.map((catGroup, cIdx) => (
            <div key={cIdx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 pb-1 border-b border-slate-800">
                {catGroup.category}
              </h4>
              <div className="space-y-2 text-xs">
                {catGroup.items.map((item, iIdx) => {
                  const itemKey = `${cIdx}-${iIdx}-${item}`;
                  const isChecked = checkedItems[itemKey];
                  return (
                    <button
                      key={itemKey}
                      onClick={() => toggleCheck(itemKey)}
                      className="w-full flex items-center space-x-2.5 text-left p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom packing item */}
        <form onSubmit={handleAddItem} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="px-3 py-1.5 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg"
          >
            {packingList.map((c, idx) => (
              <option key={idx} value={idx}>{c.category}</option>
            ))}
          </select>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add custom packing item..."
            className="flex-1 px-3 py-1.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-lg outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

      </div>
    </div>
  );
};
