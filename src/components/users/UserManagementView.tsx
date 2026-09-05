import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit,
  Mail,
  Phone,
  Building,
  Activity,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department, Role, User } from '../../types';

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, failedAttemptsMap, unlockAccount } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';

  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science & Engineering');
  const [staffId, setStaffId] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<Role>('Staff');

  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null);

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    addUser({
      fullName,
      email,
      department,
      staffId: staffId || `AIT-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      mobile: mobile || '+91 98765 43210',
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      lastLogin: 'Never',
    });

    setShowAddModal(false);
  };

  const handleResetPassword = (id: string) => {
    setResetSuccessId(id);
    setTimeout(() => setResetSuccessId(null), 2500);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Restricted Admin Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            User Management & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage faculty, department HODs, lab assistants, and system administrator access
          </p>
        </div>

        {isMonitor && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> Add New User
          </button>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Staff ID</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div>{u.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {u.staffId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {u.department}
                  </td>
                  <td className="py-3.5 px-4">
                    {isMonitor ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-[11px] outline-none"
                    >
                      <option value="Admin">Administrator</option>
                      <option value="Principal">Principal</option>
                      <option value="Dean">Dean</option>
                      <option value="HOD">Head of Department (HOD)</option>
                      <option value="Staff">Staff</option>
                      <option value="Technician">Technician</option>
                      <option value="Monitor">Monitor</option>
                    </select>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">{u.role}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {(failedAttemptsMap[u.email.toLowerCase()] || 0) >= 5 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        🔒 Locked (5 Failed)
                      </span>
                    ) : isMonitor ? (
                      <span
                        onClick={() =>
                          updateUser(u.id, {
                            status: u.status === 'Active' ? 'Inactive' : 'Active',
                          })
                        }
                        className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        ● {u.status}
                      </span>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        ● {u.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{u.lastLogin || 'Never'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(failedAttemptsMap[u.email.toLowerCase()] || 0) >= 5 && isMonitor && (
                        <button
                          onClick={() => unlockAccount(u.email)}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[10px] transition-colors"
                          title="Unlock Account"
                        >
                          Unlock Account
                        </button>
                      )}
                      {isMonitor && (
                        <>
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </>
                      )}
                    </div>
                    {resetSuccessId === u.id && (
                      <div className="text-[10px] text-emerald-500 font-bold mt-1">Reset Sent!</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Add System User</h3>
            <p className="text-xs text-slate-500 mb-6">Create new institutional staff account</p>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. S. Kanthaswamy"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@adithyatech.edu.in"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="AIT-EMP-1088"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="Computer Science & Engineering">CSE Dept</option>
                    <option value="Information Technology">IT Dept</option>
                    <option value="Electronics & Communication">ECE Dept</option>
                    <option value="Mechanical Engineering">Mech Dept</option>
                    <option value="Civil Engineering">Civil Dept</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 outline-none"
                  >
                    <option value="Staff">Staff</option>
                    <option value="HOD">HOD</option>
                    <option value="Technician">Technician</option>
                    <option value="Admin">Admin</option>
                    <option value="Monitor">Monitor</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all mt-2"
              >
                Create User
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
