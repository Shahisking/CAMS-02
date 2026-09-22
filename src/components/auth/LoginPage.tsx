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
  const { login, setActiveTab } = useApp();

  const [role, setRole] = useState<Role>('Admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      {/* Subtle transparent blue glassmorphism wash — background stays clearly visible */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(120deg, rgba(37,99,235,0.30) 0%, rgba(56,189,248,0.14) 42%, rgba(29,78,216,0.26) 78%, rgba(14,116,144,0.16) 100%)',
        }}
      />
      {/* Soft frosted sheen */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255,255,255,0.12) 0%, rgba(186,230,253,0.07) 38%, transparent 70%)',
        }}
      />

      {/* Close button if rendered as modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2.5 rounded-full text-white transition-all cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
          }}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Main Viewport Container - Desktop Layout with Right-aligned Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center lg:justify-end max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-12 my-auto">

        {/* Left Branding Text (Desktop Only) */}
        <div className="hidden lg:flex flex-col text-white max-w-lg mr-auto pr-8 space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold w-fit"
            style={{
              background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.38)',
              boxShadow: '0 8px 24px rgba(37,99,235,0.22), inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          >
            <Shield className="w-4 h-4 text-sky-100" />
            <span>Official Institutional Portal</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans drop-shadow-[0_2px_14px_rgba(30,64,175,0.5)]">
            Adithya Institute of Technology
          </h1>
          <p className="text-lg text-sky-50 font-medium drop-shadow">
            College Asset Management System (CAMS)
          </p>
          <p className="text-sm text-sky-50/85 leading-relaxed font-normal pt-2">
            Centralized intelligent asset tracking, inventory management, maintenance scheduling, and institutional compliance monitoring.
          </p>
        </div>

        {/* Right-aligned Login Card — premium frosted glass */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[430px] rounded-[20px] p-[28px] sm:p-[40px] relative"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(186,230,253,0.13) 50%, rgba(37,99,235,0.18) 100%)',
            backdropFilter: 'blur(22px) saturate(170%)',
            WebkitBackdropFilter: 'blur(22px) saturate(170%)',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow:
              '0 24px 64px rgba(30,64,175,0.32), 0 0 48px rgba(56,189,248,0.22), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          {/* Top Header: Logo + Theme Toggle */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5 shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 6px 18px rgba(30,64,175,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <CollegeLogo size="md" variant="icon-only" />
              </div>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-6">
            <h2 className="text-[26px] font-extrabold text-white tracking-tight leading-none font-sans drop-shadow">
              Sign In
            </h2>
            <p className="text-[13px] text-sky-100/85 mt-1.5 font-medium">
              Authorized Personnel Only
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              className="mb-4 p-3 text-rose-50 text-xs font-medium rounded-xl flex items-center gap-2"
              style={{
                background: 'rgba(244,63,94,0.22)',
                border: '1px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <X className="w-4 h-4 shrink-0 text-rose-100" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Select */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 drop-shadow">
                User Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as Role)}
                  className="w-full h-[50px] text-white text-sm rounded-[14px] px-3.5 outline-none appearance-none font-medium cursor-pointer transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.38)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                >
                  {rolesList.map((r) => (
                    <option key={r.role} value={r.role} className="bg-white text-[#0F172A]">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-100/80 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 drop-shadow">
                Email Address
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="principal@ait.edu.in"
                className="w-full h-[50px] text-white placeholder-sky-100/50 text-sm rounded-[14px] px-3.5 outline-none font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.38)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-white mb-1.5 drop-shadow">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-[50px] text-white placeholder-sky-100/50 text-sm rounded-[14px] pl-3.5 pr-10 outline-none font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.38)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-100/80 hover:text-white transition-colors p-1"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-sky-50 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/40 text-[#2563EB] focus:ring-sky-300 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] text-white font-bold rounded-[14px] text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:pointer-events-none mt-2"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.85), rgba(14,165,233,0.85))',
                border: '1px solid rgba(255,255,255,0.45)',
                boxShadow:
                  '0 12px 32px rgba(37,99,235,0.45), 0 0 24px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
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
      <footer
        className="relative z-10 py-3 text-center text-xs font-medium text-sky-50"
        style={{
          background: 'rgba(30,64,175,0.22)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderTop: '1px solid rgba(255,255,255,0.28)',
        }}
      >
        Copyright © Adithya Institute of Technology. All rights reserved.
      </footer>
    </div>
  );
};

