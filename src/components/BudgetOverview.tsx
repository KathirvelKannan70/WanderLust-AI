import React from 'react';
import { PieChart } from 'lucide-react';
import { Itinerary, ActivityCategory } from '../types/itinerary';
import { formatCurrency } from '../lib/formatUtils';

interface BudgetOverviewProps {
  itinerary: Itinerary;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ itinerary }) => {
  const categoryTotals: Record<ActivityCategory, number> = {
    sights: 0,
    food: 0,
    shopping: 0,
    transport: 0,
    accommodation: 0,
    nature: 0,
    nightlife: 0,
    other: 0,
  };

  let totalCalculated = 0;

  itinerary.days.forEach((day) => {
    day.stops.forEach((stop) => {
      const cost = Number(stop.estimatedCost) || 0;
      const cat = stop.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
      totalCalculated += cost;
    });
  });

  const categories = Object.entries(categoryTotals).filter(([_, val]) => val > 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-8">
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Interactive Budget Breakdown</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Total: {formatCurrency(totalCalculated, itinerary.currency)}
          </span>
        </div>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No specific cost estimates assigned to activities yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map(([cat, val]) => {
              const percentage = Math.round((val / (totalCalculated || 1)) * 100);
              return (
                <div key={cat} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="capitalize text-slate-300">{cat}</span>
                    <span className="text-emerald-400">{formatCurrency(val, itinerary.currency)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block text-right mt-1">{percentage}% of budget</span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
