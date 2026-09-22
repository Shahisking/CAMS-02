// src/components/splash/SplashScreen.tsx
// UI-only redesign: premium transparent blue glassmorphism + elegant logo ring loader.
// Functionality preserved: auto-transition to dashboard/landing, skip, retry.
import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { ArrowRight, Box, MapPin, Shield, Users, BarChart2, Sparkles } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useApp } from '../../context/AppContext';

// Rotating status lines (no percentages — purely presentational)
const loadingMessages = [
  'Initializing system…',
  'Loading campus assets…',
  'Syncing locations…',
  'Preparing dashboard…',
];

const features = [
  { icon: Box, label: 'Assets' },
  { icon: MapPin, label: 'Locations' },
  { icon: Shield, label: 'Security' },
  { icon: Users, label: 'Departments' },
  { icon: BarChart2, label: 'Reports' },
];

export const SplashScreen: React.FC = () => {
  const { setActiveTab, currentUser } = useApp();
  const [showError] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Rotate status message on a lightweight timer (no fake progress)
  useEffect(() => {
    const msg = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 700);
    return () => clearInterval(msg);
  }, []);

  // Auto-finish quickly and transition to the existing landing/login flow
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        if (currentUser) {
          setActiveTab('dashboard');
        } else {
          setActiveTab('landing');
        }
      }, 350);
    }, 2400);
    return () => clearTimeout(timer);
  }, [currentUser, setActiveTab]);

  const handleSkip = () => {
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('landing');
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const controls = useAnimation();
  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.6 + i * 0.12, duration: 0.5, ease: 'easeOut' },
    }));
  }, [controls]);

  if (showError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <h2 className="text-2xl font-semibold mb-4">Failed to initialise the application</h2>
        <p className="mb-6 text-center max-w-md text-slate-400">
          Could not be loaded. Please check your connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <style>{`
        @keyframes cams-ring-spin { to { transform: rotate(360deg); } }
        @keyframes cams-ring-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes cams-soft-pulse { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.14); opacity: .15; } }
        @keyframes cams-logo-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
        @keyframes cams-dot-bounce { 0%,80%,100% { transform: scale(.7); opacity:.4; } 40% { transform: scale(1.15); opacity:1; } }
        .cams-ring-a { animation: cams-ring-spin 9s linear infinite; }
        .cams-ring-b { animation: cams-ring-spin-rev 14s linear infinite; }
        .cams-halo { animation: cams-soft-pulse 2.6s ease-in-out infinite; }
        .cams-logo-breathe { animation: cams-logo-breathe 2.6s ease-in-out infinite; }
      `}</style>

      {/* ── Full-screen campus background (unchanged asset) ── */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/college_campus.jpg')" }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'easeOut' }}
      />

      {/* ── Subtle transparent blue glassmorphism wash (background stays clearly visible) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(37,99,235,0.30) 0%, rgba(56,189,248,0.14) 42%, rgba(29,78,216,0.26) 78%, rgba(14,116,144,0.18) 100%)',
        }}
      />
      {/* Light frosted sheen — very subtle, keeps image bright */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 46%, rgba(255,255,255,0.14) 0%, rgba(186,230,253,0.08) 35%, transparent 70%)',
        }}
      />

      {/* ── Top-left branding (preserved) ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute top-5 left-6 flex items-center gap-2 z-20"
      >
        <span
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(14px) saturate(160%)',
            WebkitBackdropFilter: 'blur(14px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.35)',
            boxShadow: '0 8px 24px rgba(37,99,235,0.22), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          <CollegeLogo size="sm" variant="icon-only" />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white tracking-wide uppercase drop-shadow">
              Adithya Institute Of Technology
            </span>
            <span className="text-[10px] text-sky-100/90 tracking-widest">Coimbatore</span>
          </span>
        </span>
      </motion.div>

      {/* ── Skip button (top-right, glass) ── */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        onClick={handleSkip}
        className="absolute top-5 right-6 z-20 inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-white px-3 py-1.5 rounded-full transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.14)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 16px rgba(37,99,235,0.20)',
        }}
      >
        Skip <ArrowRight className="w-3.5 h-3.5" />
      </motion.button>

      {/* ── Main glass content card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: isDone ? 0 : 1, y: isDone ? -12 : 0, scale: isDone ? 0.98 : 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-[calc(100%-2rem)] sm:w-full px-6 sm:px-10 py-8 sm:py-9 mx-4 rounded-[28px]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(186,230,253,0.12) 50%, rgba(37,99,235,0.16) 100%)',
          backdropFilter: 'blur(22px) saturate(170%)',
          WebkitBackdropFilter: 'blur(22px) saturate(170%)',
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow:
            '0 24px 64px rgba(30,64,175,0.30), 0 0 0 1px rgba(186,230,253,0.15), 0 0 48px rgba(56,189,248,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      >
        {/* Logo with modern glowing ring loader */}
        <div className="relative mb-6">
          {/* Outer conic glowing ring */}
          <div
            className="cams-ring-a absolute -inset-3 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0%, rgba(125,211,252,0.9) 12%, transparent 28%, transparent 55%, rgba(255,255,255,0.85) 68%, transparent 82%)',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
              filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.8))',
            }}
          />
          {/* Inner thin counter-rotating ring */}
          <div
            className="cams-ring-b absolute -inset-1.5 rounded-full"
            style={{
              border: '1.5px solid transparent',
              borderTopColor: 'rgba(255,255,255,0.9)',
              borderRightColor: 'rgba(186,230,253,0.35)',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
            }}
          />
          {/* Soft pulsing halo */}
          <div
            className="cams-halo absolute -inset-5 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%)',
            }}
          />
          {/* Logo card */}
          <div
            className="cams-logo-breathe relative p-4 rounded-3xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow:
                '0 8px 32px rgba(30,64,175,0.35), 0 0 24px rgba(56,189,248,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            <CollegeLogo size="xl" variant="icon-only" />
          </div>
          {/* Sparkle badge */}
          <span
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              boxShadow: '0 4px 16px rgba(16,185,129,0.55), 0 0 0 3px rgba(255,255,255,0.35)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
          </span>
        </div>

        {/* Title (preserved content) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mb-1"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(30,64,175,0.45)]">
            Campus Asset
          </h1>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-sky-100 drop-shadow-[0_2px_12px_rgba(30,64,175,0.45)]">
            Management
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm text-sky-50/90 tracking-[0.25em] uppercase font-medium mb-6"
        >
          Track &bull; Manage &bull; Maintain
        </motion.p>

        {/* Modern minimal loader: glowing dots + status line (no percentages, no bar) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #7dd3fc)',
                  boxShadow: '0 0 12px rgba(125,211,252,0.9)',
                  animation: `cams-dot-bounce 1.2s ease-in-out ${d * 0.18}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="h-4 flex items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={messageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-[12px] text-sky-50/85 font-medium tracking-wide"
              >
                {loadingMessages[messageIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feature icons (preserved) */}
        <motion.ul className="flex gap-4 sm:gap-6 mt-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.li
                key={f.label}
                custom={i}
                initial={{ opacity: 0, y: 14 }}
                animate={controls}
                className="flex flex-col items-center gap-1 group cursor-default"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.32)',
                    boxShadow: '0 4px 14px rgba(30,64,175,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-sky-50/80 font-medium tracking-wide">
                  {f.label}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>

      {/* ── Footer (preserved content) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="absolute bottom-5 z-20 flex flex-col items-center gap-1"
      >
        <span
          className="text-[11px] text-white/90 tracking-widest uppercase font-medium px-4 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          Campus Asset Management System
        </span>
        <span className="text-[10px] text-sky-100/70">
          v1.0 &mdash; Adithya Institute Of Technology
        </span>
      </motion.div>
    </div>
  );
};
