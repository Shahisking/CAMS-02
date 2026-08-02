import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Search,
  Filter,
  Download,
  Activity,
  UserCheck,
  ArrowLeftRight,
  Clock,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');

  // Filter audit logs based on HOD department restrictions or search/action filters
  const filteredLogs = auditLogs.filter((log) => {
    // If HOD, strictly filter to their own department or their own actions
    if (currentUser?.role === 'HOD' && currentUser.department) {
      if (log.department !== currentUser.department && log.userEmail !== currentUser.email) {
        return false;
      }
    }

    if (selectedAction !== 'All' && log.action !== selectedAction) {
      return false;
    }

    if (selectedRole !== 'All' && log.role !== selectedRole) {
      return false;
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchUser = log.user.toLowerCase().includes(query);
      const matchEmail = log.userEmail.toLowerCase().includes(query);
      const matchDetails = log.details.toLowerCase().includes(query);
      const matchAction = log.action.toLowerCase().includes(query);
      const matchDept = log.department.toLowerCase().includes(query);
      if (!matchUser && !matchEmail && !matchDetails && !matchAction && !matchDept) {
        return false;
      }
    }

    return true;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Login':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'Logout':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
      case 'Asset Creation':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Asset Update':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
      case 'Asset Transfer':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
      case 'Maintenance Request':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300';
      case 'Approval':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300';
      case 'Deletion':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Log ID', 'User', 'Email', 'Role', 'Department', 'Action', 'Details', 'IP Address', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.user}"`,
      `"${l.userEmail}"`,
      l.role,
      `"${l.department}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
      `"${l.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CAMS_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" /> Immutable Security Audit Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
            System Audit Trail Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time compliance monitoring recording all authorized login, asset allocation, and system state modifications
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer font-display"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {filteredLogs.length}
            </div>
            <div className="text-xs font-medium text-slate-500">Logged Events</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {auditLogs.filter((l) => l.action === 'Login').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Authenticated Logins</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              {auditLogs.filter((l) => l.action === 'Asset Transfer' || l.action === 'Approval').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Transfers & Approvals</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-display">
              10 Accounts
            </div>
            <div className="text-xs font-medium text-slate-500">Authorized Registry</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, email, IP, or details..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="Asset Creation">Asset Creation</option>
              <option value="Asset Update">Asset Update</option>
              <option value="Asset Transfer">Asset Transfer</option>
              <option value="Maintenance Request">Maintenance Request</option>
              <option value="Approval">Approval</option>
              <option value="Deletion">Deletion</option>
            </select>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Administrator</option>
            <option value="Principal">Principal</option>
            <option value="Dean">Dean</option>
            <option value="HOD">HOD</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Log Ref</th>
                <th className="py-3.5 px-4">User & Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Event Details</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No audit log records match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {log.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{log.user}</div>
                      <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                        <span>{log.userEmail}</span>
                        <span className="inline-block px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[9px] font-bold">
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {log.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        ● {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        {log.ipAddress}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        {log.timestamp}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
