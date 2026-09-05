import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications, currentUser } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filtered = notifications.filter(
    (n) => filterCategory === 'All' || n.category === filterCategory
  );

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            System Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time alerts for maintenance requests, warranty expiry, QR scans, and low inventory
          </p>
        </div>

        {isMonitor && (
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center gap-1.5 hover:bg-rose-100 transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear All Notifications
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          'All',
          'Maintenance Due',
          'Warranty Expired',
          'Asset Added',
          'QR Scan Success',
          'Low Inventory',
          'Lost Asset',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No notifications found under category "{filterCategory}".</div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {item.type === 'alert' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
                {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                {item.type === 'info' && <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</span>
                    <span className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-400 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.message}</p>
                  <div className="text-[10px] font-mono text-slate-400 mt-2">{item.timestamp}</div>
                </div>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
