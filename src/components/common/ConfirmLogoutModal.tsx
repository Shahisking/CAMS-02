import React from 'react';
import { motion } from 'motion/react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConfirmLogoutModal: React.FC = () => {
  const { isConfirmLogoutOpen, setIsConfirmLogoutOpen, logout, currentUser } = useApp();

  if (!isConfirmLogoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
      >
        <button
          onClick={() => setIsConfirmLogoutOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Confirm Logout</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to end your session as <strong>{currentUser?.fullName}</strong>? Unsaved form progress may be lost.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfirmLogoutOpen(false)}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" /> Yes, Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};
