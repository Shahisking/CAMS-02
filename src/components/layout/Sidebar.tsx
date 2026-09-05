import React from 'react';
import { CollegeLogo } from '../common/CollegeLogo';
import {
  LayoutDashboard,
  Boxes,
  Building2,
  Building,
  Grid,
  Store,
  FileText,
  ArrowLeftRight,
  Wrench,
  Trash2,
  BarChart2,
  History,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
} from 'lucide-react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { Role } from '../../types';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenAddAssetModal: () => void;
  onOpenQRScanner?: () => void;
  onOpenLogoutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenAddAssetModal,
}) => {
  const { activeTab, setActiveTab, maintenanceTickets, setIsConfirmLogoutOpen, currentUser } =
    useApp();

  const pendingMaintenanceCount = maintenanceTickets.filter(
    (t) => t.status === 'Pending' || t.status === 'In Progress'
  ).length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    roles?: Role[];
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'assets', label: 'Assets', icon: <Boxes className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
    { id: 'blocks', label: 'Blocks', icon: <Building className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <Grid className="w-4 h-4" /> },
    { id: 'vendors', label: 'Vendors', icon: <Store className="w-4 h-4" /> },
    { id: 'requests', label: 'Requests', icon: <FileText className="w-4 h-4" /> },
    { id: 'allocation', label: 'Issue / Return', icon: <ArrowLeftRight className="w-4 h-4" /> },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: <Wrench className="w-4 h-4" />,
      badge: pendingMaintenanceCount > 0 ? pendingMaintenanceCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'reports', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'audit-logs', label: 'Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, roles: ['Monitor'] },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, roles: ['Monitor'] },
    { id: 'system-monitor', label: 'System Monitor', icon: <Activity className="w-4 h-4" />, roles: ['Monitor'] },
  ];

  const isMonitor = currentUser?.role === 'Monitor';

  const handleNavClick = (item: (typeof navItems)[0]) => {
    setActiveTab(item.id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside sidebar */}
        <div>
          <div className="h-16 px-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            {!isCollapsed ? (
              <div className="flex items-center gap-2 truncate">
                <CollegeLogo size="sm" variant="icon-only" />
                <div className="truncate">
                  <div className="text-[10px] font-black text-slate-900 dark:text-white font-display tracking-tight truncate leading-tight">
                    Adithya Institute of Technology
                  </div>
                  <div className="text-[9px] font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                    CAMS Panel
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <CollegeLogo size="sm" variant="icon-only" />
              </div>
            )}
            {/* Desktop Collapse / Back Button */}
            <button
              type="button"
              onClick={() => onToggleCollapse?.()}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" /> : <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
            </button>

            {/* Mobile Back / Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex lg:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Quick Action Callout */}
          {!isCollapsed && (
            <div className="p-3">
              {isMonitor ? (
                <button
                  onClick={onOpenAddAssetModal}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Asset</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('maintenance');
                    onCloseMobile();
                  }}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Submit an issue report or asset request to System Monitor"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Report Issue to Monitor</span>
                </button>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              if (item.roles && (!currentUser || !item.roles.includes(currentUser.role))) {
                return null;
              }
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all relative group cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                      : 'text-[#4B5563] dark:text-slate-300 hover:bg-[#EFF6FF] hover:text-[#2563EB] dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-[#6B7280] dark:text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-white'}`}>
                    {item.icon}
                  </span>

                  {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.badgeColor || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Logout Area */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setIsConfirmLogoutOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
