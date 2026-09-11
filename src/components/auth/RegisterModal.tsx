import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Lock,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department, Role } from '../../types';

export const RegisterModal: React.FC = () => {
  const { register, setActiveTab } = useApp();

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science & Engineering');
  const [staffId, setStaffId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Staff');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !staffId) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    register({
      fullName,
      department,
      staffId,
      email,
      mobile,
      role,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">Adithya Institute of Technology</div>
              <div className="text-xs text-blue-400 font-semibold">Registration</div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('landing')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-1">Create CAMS Account</h2>
        <p className="text-slate-400 text-xs mb-6">
          Register with your institutional staff or faculty credentials
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. S. Kanthaswamy"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Staff ID / Student ID *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="AIT-EMP-1055"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Department *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                >
                  <option value="Computer Science & Engineering">CSE Department</option>
                  <option value="Information Technology">IT Department</option>
                  <option value="Electronics & Communication">ECE Department</option>
                  <option value="Electrical & Electronics">EEE Department</option>
                  <option value="Mechanical Engineering">Mech Department</option>
                  <option value="Civil Engineering">Civil Department</option>
                  <option value="Artificial Intelligence & Data Science">AI & DS Department</option>
                  <option value="Administrative Office">Administrative Office</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Hostel Management">Hostel Management</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="Staff">Faculty / Staff Member</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="Technician">Lab / Maintenance Tech</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kanthaswamy@adithyatech.edu.in"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-4"
          >
            Complete Registration <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setActiveTab('login')}
            className="text-blue-400 font-semibold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </motion.div>
    </div>
  );
};
