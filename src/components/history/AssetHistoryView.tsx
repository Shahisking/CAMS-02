import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  Clock,
  ShoppingBag,
  ArrowLeftRight,
  Wrench,
  CheckCircle2,
  DollarSign,
  User,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AssetHistoryView: React.FC = () => {
  const { historyEvents, assets } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('All');

  const filteredEvents = historyEvents.filter(
    (e) => selectedAssetId === 'All' || e.assetId === selectedAssetId
  );

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Asset Lifecycle Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Complete audit trail across purchases, allocations, repairs, inspections and reassignments
          </p>
        </div>

        {/* Asset Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Filter Asset:</span>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none shadow-xs"
          >
            <option value="All">All Campus Assets ({assets.length})</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 sm:before:left-5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">No history events logged yet.</div>
          ) : (
            filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex items-start gap-4 sm:gap-6 pl-8 sm:pl-12"
              >
                {/* Timeline Dot Icon */}
                <div className="absolute left-0 top-1 w-7 h-7 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
                  {event.type === 'Purchase' && <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                  {event.type === 'Allocation' && <ArrowLeftRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                  {event.type === 'Transfer' && <ArrowLeftRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                  {event.type === 'Maintenance' && <Wrench className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                  {event.type === 'Inspection' && <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                  {event.type === 'Status Change' && <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
                </div>

                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px]">
                        {event.assetId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>Performed By: {event.performedBy}</span>
                    {event.cost && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Amount: ₹{event.cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
