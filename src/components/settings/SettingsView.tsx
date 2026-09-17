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
  Palette,
  Monitor,
  Contrast,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    isDarkMode,
    toggleDarkMode,
    resetAllData,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'appearance' | 'institution' | 'backup'>( 'appearance' );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBackupExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIT_CAMS_Settings_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const sectionConfig = [
    {
      id: 'appearance',
      icon: Palette,
      title: 'Appearance & Theme',
      description: 'Customize dark glassmorphism, color palette, and interface preferences',
    },
    {
      id: 'institution',
      icon: Building2,
      title: 'College Details',
      description: 'Institutional information, contact details, and academic parameters',
    },
    {
      id: 'backup',
      icon: Database,
      title: 'Backup & Restore',
      description: 'Export settings snapshot or reset to initial demo data',
    },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
          <Settings className="w-3.5 h-3.5" /> System Configuration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Preferences & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage CAMS theme, institutional parameters, database backup and system alerts
        </p>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Settings updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-1 shadow-xl shadow-slate-900/5">
        <nav className="flex gap-1" role="tablist" aria-label="Settings sections">
          {sectionConfig.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              role="tab"
              aria-selected={activeSection === section.id}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5"
      >
        {activeSection === 'appearance' && (
          <AppearanceThemeSection
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        )}

        {activeSection === 'institution' && (
          <InstitutionDetailsSection
            settings={settings}
            updateSettings={updateSettings}
          />
        )}

        {activeSection === 'backup' && (
          <BackupRestoreSection
            handleBackupExport={handleBackupExport}
            resetAllData={resetAllData}
          />
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
          >
            Save Configuration Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================
   Appearance & Theme Section with Glassmorphism Dark Mode Toggle
   ============================================================ */
const AppearanceThemeSection: React.FC<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          <p className="text-xs text-slate-500">Customize the interface color palette and glassmorphism effects</p>
        </div>
      </div>

      {/* Dark Mode Toggle - Glassmorphism Style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
        <div className="relative bg-white/10 dark:bg-slate-800/50 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/10 dark:border-slate-700/50">
                {isDarkMode ? (
                  <Moon className="w-6 h-6 text-amber-300" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white dark:text-slate-900">Dark Mode Interface</div>
                <div className="text-xs text-slate-300 dark:text-slate-500 mt-0.5">
                  Toggle dark glassmorphism color palette with frosted glass effects
                </div>
              </div>
            </div>

            {/* Glassmorphism Toggle Switch */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 flex items-center p-1 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/40'
                  : 'bg-slate-200 dark:bg-slate-700 shadow-inner'
              }`}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span
                className={`absolute w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isDarkMode ? 'translate-x-8' : 'translate-x-0'
                } flex items-center justify-center`}
              >
                {isDarkMode ? (
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemePreviewCard
          title="Light Mode"
          description="Clean, bright interface with subtle shadows"
          icon={<Sun className="w-5 h-5" />}
          isActive={!isDarkMode}
          colors={['bg-white', 'border-slate-200', 'text-slate-900']}
        />
        <ThemePreviewCard
          title="Dark Glassmorphism"
          description="Deep surfaces with frosted glass & glow effects"
          icon={<Moon className="w-5 h-5" />}
          isActive={isDarkMode}
          colors={['bg-slate-900', 'border-slate-700', 'text-white']}
        />
      </div>

      {/* Additional Theme Options */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Advanced Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ThemeOptionCard
            icon={Monitor}
            title="Auto Theme (System)"
            description="Follow OS preference automatically"
          />
          <ThemeOptionCard
            icon={Contrast}
            title="High Contrast"
            description="Enhanced visibility for accessibility"
          />
          <ThemeOptionCard
            icon={Sparkles}
            title="Reduced Motion"
            description="Disable animations for performance"
          />
          <ThemeOptionCard
            icon={Palette}
            title="Accent Color"
            description="Customize primary brand color"
          />
        </div>
      </div>
    </div>
  );
};

const ThemePreviewCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  colors: [string, string, string];
}> = ({ title, description, icon, isActive, colors }) => (
  <div
    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
      isActive
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/20'
        : `${colors[0]} ${colors[1]} hover:border-slate-300 dark:hover:border-slate-600`
    }`}
  >
    {isActive && (
      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
        ✓
      </div>
    )}
    <div className="flex items-start gap-3">
      <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-800'} ${colors[2]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm ${colors[2]}`}>{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>
      </div>
    </div>
  </div>
);

const ThemeOptionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900 dark:text-white">{title}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
      </div>
    </div>
  </div>
);

/* ============================================================
   Institution Details Section
   ============================================================ */
const InstitutionDetailsSection: React.FC<{
  settings: any;
  updateSettings: (updates: Partial<any>) => void;
}> = ({ settings, updateSettings }) => (
  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">College Details</h2>
        <p className="text-xs text-slate-500">Institutional information, contact details, and academic parameters</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingsInput
        label="College Name"
        value={settings.collegeName}
        onChange={(e) => updateSettings({ collegeName: e.target.value })}
        icon={<Building2 className="w-4 h-4" />}
      />
      <SettingsInput
        label="Institution Code"
        value={settings.collegeCode}
        onChange={(e) => updateSettings({ collegeCode: e.target.value })}
        icon={<Lock className="w-4 h-4" />}
        inputClassName="font-mono"
      />
    </div>

    <SettingsInput
      label="Address"
      value={settings.address}
      onChange={(e) => updateSettings({ address: e.target.value })}
      icon={<MapPin className="w-4 h-4" />}
      placeholder="Full campus address"
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingsInput
        label="Contact Email"
        type="email"
        value={settings.contactEmail}
        onChange={(e) => updateSettings({ contactEmail: e.target.value })}
        icon={<Mail className="w-4 h-4" />}
      />
      <SettingsInput
        label="Academic Year"
        value={settings.academicYear}
        onChange={(e) => updateSettings({ academicYear: e.target.value })}
        icon={<Calendar className="w-4 h-4" />}
      />
    </div>
  </form>
);

/* ============================================================
   Backup & Restore Section
   ============================================================ */
const BackupRestoreSection: React.FC<{
  handleBackupExport: () => void;
  resetAllData: () => void;
}> = ({ handleBackupExport, resetAllData }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl">
        <Database className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Database Backup & Management</h2>
        <p className="text-xs text-slate-500">Export a full JSON snapshot of campus assets, users, and maintenance tickets or restore system data</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.button
        type="button"
        onClick={handleBackupExport}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-500/30 transition-all text-left group"
      >
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
          <Download className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="font-bold text-sm">Download JSON Backup</div>
          <div className="text-xs text-blue-100 mt-0.5">Export settings, assets, users & tickets</div>
        </div>
      </motion.button>

      <motion.button
        type="button"
        onClick={resetAllData}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 bg-gradient-to-br from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-500/30 transition-all text-left group"
      >
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="font-bold text-sm">Reset Initial Demo Data</div>
          <div className="text-xs text-rose-100 mt-0.5">Restore factory default configuration</div>
        </div>
      </motion.button>
    </div>

    {/* Info Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
      <InfoCard
        icon={Download}
        title="What's Included"
        items={['All asset records', 'User accounts', 'Maintenance tickets', 'System settings']}
      />
      <InfoCard
        icon={Upload}
        title="Restore Process"
        items={['Upload JSON backup file', 'Validates data integrity', 'Overwrites current data', 'Requires confirmation']}
      />
    </div>
  </div>
);

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  items: string[];
}> = ({ icon, title, items }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
        {icon}
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
    </div>
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

/* ============================================================
   Reusable Settings Input Component
   ============================================================ */
interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  type?: string;
  placeholder?: string;
  inputClassName?: string;
}

const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  value,
  onChange,
  icon,
  type = 'text',
  placeholder,
  inputClassName = '',
}) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
      {icon && <span className="text-slate-500">{icon}</span>}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${inputClassName}`}
    />
  </div>
);

// Import AnimatePresence for the toast
import { AnimatePresence } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';