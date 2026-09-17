// src/components/splash/SplashScreen.tsx
import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { ArrowRight, Box, MapPin, Shield, Users, BarChart2, Sparkles } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useApp } from '../../context/AppContext';

// Loading message rotation
const loadingMessages = [
  'Initializing system…',
  'Loading campus assets…',
  'Syncing locations…',
  'Checking database…',
  'Preparing dashboard…',
  'Almost ready…',
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
  const [loadProgress, setLoadProgress] = useState(0);

  // Simulate loading progress locally
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Accelerate near the end
        const increment = prev < 70 ? Math.random() * 8 + 4 : Math.random() * 3 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const messageIndex = Math.min(
    Math.floor((loadProgress / 100) * loadingMessages.length),
    loadingMessages.length - 1,
  );
  const currentMessage = loadingMessages[messageIndex];

  // Handle navigation after load completes
  useEffect(() => {
    if (loadProgress >= 100) {
      setTimeout(() => {
        if (currentUser) {
          setActiveTab('dashboard');
        } else {
          setActiveTab('landing');
        }
      }, 400);
    }
  }, [loadProgress, currentUser, setActiveTab]);


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
      {/* ── Full-screen campus background ── */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/college_campus.jpg')" }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'easeOut' }}
      />

      {/* ── Dark gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(5,10,30,0.82) 0%, rgba(10,30,60,0.75) 50%, rgba(0,0,0,0.70) 100%)',
        }}
      />

      {/* ── Subtle radial glow in centre ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── Top-left branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute top-5 left-6 flex items-center gap-2 z-20"
      >
        <CollegeLogo size="sm" variant="icon-only" />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-sky-300 tracking-wide uppercase">
            Adithya College of Arts &amp; Science
          </span>
          <span className="text-[10px] text-white/50 tracking-widest">Coimbatore</span>
        </div>
      </motion.div>

      {/* ── Skip button (top-right) ── */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        onClick={handleSkip}
        className="absolute top-5 right-6 z-20 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full transition-all duration-200"
      >
        Skip <ArrowRight className="w-3.5 h-3.5" />
      </motion.button>

      {/* ── Main content card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full px-6"
      >
        {/* Logo ring */}
        <div className="relative mb-7">
          {/* Outer spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-full"
            style={{ border: '2px dashed rgba(56,189,248,0.4)' }}
          />
          {/* Pulsing halo */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
            }}
          />
          {/* Logo card */}
          <div
            className="relative p-4 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <CollegeLogo size="xl" variant="icon-only" />
          </div>
          {/* Sparkle badge */}
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full shadow-lg shadow-emerald-500/40">
            <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
          </span>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mb-1"
        >
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Campus Asset
          </h1>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #bae6fd 0%, #38bdf8 50%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Management
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm text-white/55 tracking-[0.25em] uppercase font-medium mb-8"
        >
          Track &bull; Manage &bull; Maintain
        </motion.p>

        {/* Progress bar container */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-full max-w-sm mb-2"
        >
          {/* Bar track */}
          <div
            className="relative h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            {/* Animated fill */}
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)',
                boxShadow: '0 0 12px rgba(56,189,248,0.7)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ ease: 'easeInOut', duration: 0.45 }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute top-0 left-0 h-full w-16 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
              animate={{ x: ['-100%', '700%'] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 0.3,
              }}
            />
          </div>

          {/* Status text */}
          <div className="flex justify-between items-center mt-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentMessage}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] text-white/50 font-mono"
              >
                {currentMessage}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] font-mono font-bold text-sky-400">{loadProgress}%</span>
          </div>
        </motion.div>

        {/* Feature icons */}
        <motion.ul className="flex gap-6 mt-7">
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
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <Icon className="w-5 h-5 text-sky-300" />
                </div>
                <span className="text-[10px] text-white/50 font-medium tracking-wide">
                  {f.label}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="absolute bottom-5 z-20 flex flex-col items-center gap-1"
      >
        <span className="text-[11px] text-white/35 tracking-widest uppercase font-medium">
          Campus Asset Management System
        </span>
        <span className="text-[10px] text-white/20">
          v1.0 &mdash; Adithya College of Arts &amp; Science
        </span>
      </motion.div>
    </div>
  );
};
