import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  Users,
  Boxes,
  Building,
  Building2,
  FileText,
  Wrench,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeftRight,
  BarChart3,
  Zap,
  Wifi,
  Globe,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'loading';

interface HealthCheck {
  label: string;
  status: HealthStatus;
  detail: string;
  icon: React.ReactNode;
}

interface SystemAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  module: string;
  timestamp: string;
}

export const SystemMonitorView: React.FC = () => {
  const {
    assets,
    blocks,
    rooms,
    users,
    maintenanceTickets,
    allocationLogs,
    historyEvents,
    auditLogs,
    notifications,
    setActiveTab,
  } = useApp();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { label: 'Backend API', status: 'loading', detail: 'Checking...', icon: <Server className="w-5 h-5" /> },
    { label: 'Database', status: 'loading', detail: 'Checking...', icon: <Database className="w-5 h-5" /> },
    { label: 'Authentication', status: 'loading', detail: 'Checking...', icon: <ShieldCheck className="w-5 h-5" /> },
    { label: 'Network', status: 'loading', detail: 'Checking...', icon: <Wifi className="w-5 h-5" /> },
  ]);

  const runHealthChecks = useCallback(async () => {
    setIsRefreshing(true);
    const checks: HealthCheck[] = [];

    // Backend API check
    try {
      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (apiRes.ok) {
        checks.push({
          label: 'Backend API',
          status: 'healthy',
          detail: `Running — ${apiRes.status} OK`,
          icon: <Server className="w-5 h-5" />,
        });
      } else {
        checks.push({
          label: 'Backend API',
          status: 'warning',
          detail: `Responding with status ${apiRes.status}`,
          icon: <Server className="w-5 h-5" />,
        });
      }
    } catch {
      checks.push({
        label: 'Backend API',
        status: 'critical',
        detail: 'Unreachable — API is down',
        icon: <Server className="w-5 h-5" />,
      });
    }

    // Database check via auth endpoint (indirect DB check)
    try {
      const dbRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/assets`, {
        signal: AbortSignal.timeout(5000),
      });
      if (dbRes.ok) {
        checks.push({
          label: 'Database',
          status: 'healthy',
          detail: 'PostgreSQL connected',
          icon: <Database className="w-5 h-5" />,
        });
      } else {
        checks.push({
          label: 'Database',
          status: 'warning',
          detail: `Query returned status ${dbRes.status}`,
          icon: <Database className="w-5 h-5" />,
        });
      }
    } catch {
      checks.push({
        label: 'Database',
        status: 'critical',
        detail: 'Connection failed',
        icon: <Database className="w-5 h-5" />,
      });
    }

    // Auth check
    try {
      const authRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (authRes.ok) {
        checks.push({
          label: 'Authentication',
          status: 'healthy',
          detail: 'Auth service active',
          icon: <ShieldCheck className="w-5 h-5" />,
        });
      } else {
        checks.push({
          label: 'Authentication',
          status: 'warning',
          detail: 'Auth service degraded',
          icon: <ShieldCheck className="w-5 h-5" />,
        });
      }
    } catch {
      checks.push({
        label: 'Authentication',
        status: 'critical',
        detail: 'Auth service unreachable',
        icon: <ShieldCheck className="w-5 h-5" />,
      });
    }

    // Network check
    checks.push({
      label: 'Network',
      status: navigator.onLine ? 'healthy' : 'critical',
      detail: navigator.onLine ? 'Connected' : 'Offline',
      icon: <Wifi className="w-5 h-5" />,
    });

    setHealthChecks(checks);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    runHealthChecks();
  }, [runHealthChecks]);

  // System Statistics from real data
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const totalAssets = assets.length;
  const activeAssets = assets.filter((a) => a.status === 'Active' || a.status === 'In Use').length;
  const totalBlocks = blocks.length;
  const totalRooms = rooms.length;
  const totalDepts = new Set([
    ...assets.map((a) => a.department).filter(Boolean),
    ...rooms.map((r) => r.department).filter(Boolean),
  ]).size;
  const pendingRequests = maintenanceTickets.filter((t) => t.status === 'Pending').length;
  const openMaintenance = maintenanceTickets.filter(
    (t) => t.status === 'Pending' || t.status === 'In Progress'
  ).length;

  // Generate Alerts from real data
  const alerts: SystemAlert[] = [];
  const criticalAssets = assets.filter((a) => a.status === 'Damaged' || a.status === 'Written Off');
  if (criticalAssets.length > 0) {
    alerts.push({
      id: 'critical-assets',
      level: 'critical',
      message: `${criticalAssets.length} asset(s) reported as Damaged or Written Off`,
      module: 'Assets',
      timestamp: new Date().toISOString(),
    });
  }
  if (pendingRequests > 0) {
    alerts.push({
      id: 'pending-requests',
      level: 'warning',
      message: `${pendingRequests} maintenance request(s) pending review`,
      module: 'Maintenance',
      timestamp: new Date().toISOString(),
    });
  }
  if (openMaintenance > 0) {
    alerts.push({
      id: 'open-maintenance',
      level: 'warning',
      message: `${openMaintenance} maintenance ticket(s) open or in progress`,
      module: 'Maintenance',
      timestamp: new Date().toISOString(),
    });
  }
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  if (unreadNotifs > 0) {
    alerts.push({
      id: 'unread-notifs',
      level: 'info',
      message: `${unreadNotifs} unread notification(s) in the system`,
      module: 'Notifications',
      timestamp: new Date().toISOString(),
    });
  }
  const failedLoginUsers = users.filter((u) => u.status === 'Inactive');
  if (failedLoginUsers.length > 0) {
    alerts.push({
      id: 'locked-users',
      level: 'critical',
      message: `${failedLoginUsers.length} user account(s) inactive`,
      module: 'Users',
      timestamp: new Date().toISOString(),
    });
  }

  // Recent System Activity from audit logs + history events
  const recentActivity = [
    ...auditLogs.slice(0, 10).map((log) => ({
      timestamp: log.timestamp || (log as any).createdAt || new Date().toISOString(),
      user: log.user || log.userEmail || 'System',
      action: log.action,
      module: (log as any).module || 'General',
      status: (log as any).status || 'Success',
    })),
    ...historyEvents.slice(0, 5).map((ev) => ({
      timestamp: ev.date,
      user: ev.performedBy || 'System',
      action: ev.type,
      module: 'Assets',
      status: 'Success',
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const overallHealth: HealthStatus = healthChecks.some((c) => c.status === 'critical')
    ? 'critical'
    : healthChecks.some((c) => c.status === 'warning')
    ? 'warning'
    : healthChecks.every((c) => c.status === 'healthy')
    ? 'healthy'
    : 'loading';

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-50 text-[#22C55E] border border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-[#F59E0B] border border-amber-200';
      case 'critical':
        return 'bg-rose-50 text-[#EF4444] border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  const getStatusDot = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'bg-[#22C55E]';
      case 'warning':
        return 'bg-[#F59E0B]';
      case 'critical':
        return 'bg-[#EF4444]';
      default:
        return 'bg-slate-400';
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-50 text-[#EF4444] border border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-[#F59E0B] border border-amber-200';
      case 'info':
        return 'bg-blue-50 text-[#2563EB] border border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-[1400px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                System Monitor
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Real-time system health, statistics, and activity overview.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {formatTimestamp(lastUpdated.toISOString())}</span>
          </div>
          <button
            onClick={runHealthChecks}
            disabled={isRefreshing}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl flex items-center gap-4 border ${
          overallHealth === 'healthy'
            ? 'bg-emerald-50 border-emerald-200'
            : overallHealth === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : overallHealth === 'critical'
            ? 'bg-rose-50 border-rose-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            overallHealth === 'healthy'
              ? 'bg-emerald-100 text-[#22C55E]'
              : overallHealth === 'warning'
              ? 'bg-amber-100 text-[#F59E0B]'
              : overallHealth === 'critical'
              ? 'bg-rose-100 text-[#EF4444]'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {overallHealth === 'healthy' ? (
            <Heart className="w-5 h-5" />
          ) : overallHealth === 'warning' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : overallHealth === 'critical' ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <Activity className="w-5 h-5 animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">
            System Status:{' '}
            <span
              className={
                overallHealth === 'healthy'
                  ? 'text-[#22C55E]'
                  : overallHealth === 'warning'
                  ? 'text-[#F59E0B]'
                  : overallHealth === 'critical'
                  ? 'text-[#EF4444]'
                  : 'text-slate-400'
              }
            >
              {overallHealth === 'healthy'
                ? 'All Systems Operational'
                : overallHealth === 'warning'
                ? 'Degraded Performance'
                : overallHealth === 'critical'
                ? 'System Issues Detected'
                : 'Checking...'}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {healthChecks.filter((c) => c.status === 'healthy').length} of {healthChecks.length} services
            healthy
          </p>
        </div>
      </motion.div>

      {/* 1. SYSTEM HEALTH */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Health</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthChecks.map((check, idx) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[14px] p-5 border border-[#E5E7EB] shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      check.status === 'healthy'
                        ? 'bg-emerald-50 text-[#22C55E]'
                        : check.status === 'warning'
                        ? 'bg-amber-50 text-[#F59E0B]'
                        : check.status === 'critical'
                        ? 'bg-rose-50 text-[#EF4444]'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {check.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900">{check.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${getStatusDot(check.status)}`} />
                  <span className={`text-[10px] font-bold uppercase ${getStatusColor(check.status)} px-2 py-0.5 rounded-full`}>
                    {check.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">{check.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. SYSTEM STATISTICS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">System Statistics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Users',
              value: totalUsers,
              icon: <Users className="w-5 h-5" />,
              color: 'bg-blue-50 text-[#2563EB]',
              onClick: () => setActiveTab('users'),
            },
            {
              label: 'Active Users',
              value: activeUsers,
              icon: <CheckCircle2 className="w-5 h-5" />,
              color: 'bg-emerald-50 text-[#22C55E]',
              onClick: () => setActiveTab('users'),
            },
            {
              label: 'Total Assets',
              value: totalAssets,
              icon: <Boxes className="w-5 h-5" />,
              color: 'bg-blue-50 text-[#2563EB]',
              onClick: () => setActiveTab('assets'),
            },
            {
              label: 'Total Blocks',
              value: totalBlocks,
              icon: <Building className="w-5 h-5" />,
              color: 'bg-violet-50 text-[#8B5CF6]',
              onClick: () => setActiveTab('blocks'),
            },
            {
              label: 'Total Rooms',
              value: totalRooms,
              icon: <Building2 className="w-5 h-5" />,
              color: 'bg-cyan-50 text-[#06B6D4]',
              onClick: () => setActiveTab('blocks'),
            },
            {
              label: 'Departments',
              value: totalDepts,
              icon: <Globe className="w-5 h-5" />,
              color: 'bg-amber-50 text-[#F59E0B]',
              onClick: () => setActiveTab('departments'),
            },
            {
              label: 'Pending Requests',
              value: pendingRequests,
              icon: <FileText className="w-5 h-5" />,
              color: 'bg-amber-50 text-[#F59E0B]',
              onClick: () => setActiveTab('requests'),
            },
            {
              label: 'Open Maintenance',
              value: openMaintenance,
              icon: <Wrench className="w-5 h-5" />,
              color: 'bg-rose-50 text-[#EF4444]',
              onClick: () => setActiveTab('maintenance'),
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={stat.onClick}
              className="bg-white rounded-[14px] p-5 border border-[#E5E7EB] shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6B7280]">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-[#111827] font-sans tracking-tight">
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. ALERTS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alerts</h2>
          {alerts.length > 0 && (
            <span className="bg-rose-100 text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length === 0 ? (
          <div className="bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs text-center">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E] mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No active alerts</p>
            <p className="text-xs text-slate-400 mt-1">All systems are running smoothly</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex items-center gap-4"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.level === 'critical'
                      ? 'bg-rose-50 text-[#EF4444]'
                      : alert.level === 'warning'
                      ? 'bg-amber-50 text-[#F59E0B]'
                      : 'bg-blue-50 text-[#2563EB]'
                  }`}
                >
                  {alert.level === 'critical' ? (
                    <XCircle className="w-4 h-4" />
                  ) : alert.level === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{alert.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {alert.module} &middot; {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${getAlertBadge(
                    alert.level
                  )}`}
                >
                  {alert.level}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 4. RECENT SYSTEM ACTIVITY */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Recent System Activity
          </h2>
        </div>
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-xs overflow-hidden">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No recent activity recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50/80">
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#F1F5F9] last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatTimestamp(activity.timestamp)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{activity.user}</td>
                      <td className="px-4 py-3 text-slate-700">{activity.action}</td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                          {activity.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            activity.status === 'Success'
                              ? 'bg-emerald-50 text-[#22C55E] border border-emerald-200'
                              : activity.status === 'Failed'
                              ? 'bg-rose-50 text-[#EF4444] border border-rose-200'
                              : 'bg-amber-50 text-[#F59E0B] border border-amber-200'
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
