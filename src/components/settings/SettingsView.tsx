import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Sun,
  Moon,
  Building2,
  Mail,
  Phone,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    isDarkMode,
    toggleDarkMode,
    resetAllData,
    assets,
    maintenanceTickets,
    users,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBackupExport = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings,
      assets,
      maintenanceTickets,
      users,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIT_CAMS_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          System Preferences & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage CAMS theme, institutional parameters, database backup and system alerts
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Theme & Display Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode Interface</div>
              <div className="text-xs text-slate-500">Toggle dark glassmorphism color palette</div>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center gap-2"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              <span>{isDarkMode ? 'Dark Mode On' : 'Light Mode On'}</span>
            </button>
          </div>
        </div>

        {/* Institutional Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">College Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                College Name
              </label>
              <input
                type="text"
                value={settings.collegeName}
                onChange={(e) => updateSettings({ collegeName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Institution Code
              </label>
              <input
                type="text"
                value={settings.collegeCode}
                onChange={(e) => updateSettings({ collegeCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => updateSettings({ address: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => updateSettings({ academicYear: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Backup & Data Restore */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Database Backup & Management</h2>
          <p className="text-xs text-slate-500">
            Export a full JSON snapshot of campus assets, users, and maintenance tickets or restore system data
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleBackupExport}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" /> Download JSON Backup
            </button>

            <button
              type="button"
              onClick={resetAllData}
              className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center gap-2 hover:bg-rose-100 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset Initial Demo Data
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20"
        >
          Save Configuration Changes
        </button>
      </form>
    </div>
  );
};
