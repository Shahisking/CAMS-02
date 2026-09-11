import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CollegeLogo } from '../common/CollegeLogo';
import campusBg from '../../assets/images/ait_campus_hero.jpg';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Moon,
  Sun,
  Boxes,
  BarChart3,
  Shield,
  ChevronDown,
  Check,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

interface LoginPageProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onClose, isModal = false }) => {
  const { login, isDarkMode, toggleDarkMode, setActiveTab } = useApp();

  const [role, setRole] = useState<Role>('Admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const rolesList: { role: Role; label: string }[] = [
    { role: 'Admin', label: 'Administrator' },
    { role: 'Principal', label: 'Principal' },
    { role: 'Dean', label: 'Dean' },
    { role: 'HOD', label: 'Head of Department (HOD)' },
    { role: 'Staff', label: 'Staff Member' },
    { role: 'Technician', label: 'Lab Technician' },
    { role: 'Monitor', label: 'System Monitor' },
  ];

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Please enter your official college email.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password, role);
      if (success) {
        setActiveTab('dashboard');
      } else {
        setErrorMsg('Invalid credentials. Please check your password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setForgotModalOpen(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-[#2563EB] selection:text-white font-sans">
      {/* Full-Screen Campus Background Image - Unaltered, Cover, Center */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${campusBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Dark blue gradient overlay for readability without image blur */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.45) 40%, rgba(15, 23, 42, 0.35) 70%, rgba(15, 23, 42, 0.50) 100%)',
        }}
      />

      {/* Close button if rendered as modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2.5 bg-white/90 hover:bg-white rounded-full text-[#0F172A] shadow-lg transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Viewport Container - Desktop Layout with Right-aligned Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center lg:justify-end max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-12 my-auto">
        
        {/* Left Branding Text (Desktop Only) */}
        <div className="hidden lg:flex flex-col text-white max-w-lg mr-auto pr-8 space-y-4 drop-shadow-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold w-fit">
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Official Institutional Portal</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Adithya Institute of Technology
          </h1>
          <p className="text-lg text-slate-100 font-medium">
            College Asset Management System (CAMS)
          </p>
          <p className="text-sm text-slate-200/90 leading-relaxed font-normal pt-2">
            Centralized intelligent asset tracking, inventory management, maintenance scheduling, and institutional compliance monitoring.
          </p>
        </div>

        {/* Right-aligned Login Card (Exact Specs) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[430px] rounded-[20px] p-[28px] sm:p-[40px] border border-[#E2E8F0] shadow-[0_20px_50px_rgba(15,23,42,0.18)] relative backdrop-blur-[8px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
          }}
        >
          {/* Top Header: Logo + Theme Toggle */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                <CollegeLogo size="md" variant="icon-only" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] tracking-tight leading-snug">
                  Adithya Institute of Technology
                </h3>
                <p className="text-[11px] font-semibold text-[#64748B]">
                  College Asset Management System (CAMS)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleDarkMode();
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-medium border border-slate-200 transition-all cursor-pointer shrink-0 active:scale-95"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500 pointer-events-none" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 pointer-events-none" />
              )}
            </button>
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-6">
            <h2 className="text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-none font-sans">
              Sign In
            </h2>
            <p className="text-[13px] text-[#64748B] mt-1.5 font-medium">
              Authorized Personnel Only
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Select */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                User Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="w-full h-[50px] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F172A] text-sm rounded-[14px] px-3.5 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 appearance-none font-medium cursor-pointer transition-all"
                >
                  {rolesList.map((r) => (
                    <option key={r.role} value={r.role} className="bg-white text-[#0F172A]">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="principal@ait.edu.in"
                className="w-full h-[50px] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F172A] placeholder-[#94A3B8] text-sm rounded-[14px] px-3.5 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[50px] bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#0F172A] placeholder-[#94A3B8] text-sm rounded-[14px] pl-3.5 pr-10 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#475569] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-[14px] text-base shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>



        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs font-medium text-slate-200 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
        Copyright © Adithya Institute of Technology. All rights reserved.
      </footer>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-[#E2E8F0] p-6 rounded-[20px] max-w-sm w-full relative shadow-2xl"
          >
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Enter your official college email to receive password reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset link sent to your email inbox!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="principal@ait.edu.in"
                  className="w-full h-[46px] bg-white border border-[#CBD5E1] text-[#0F172A] text-xs rounded-[12px] px-3.5 outline-none focus:border-[#2563EB]"
                  required
                />
                <button
                  type="submit"
                  className="w-full h-[46px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-[12px] text-xs transition-all cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};


