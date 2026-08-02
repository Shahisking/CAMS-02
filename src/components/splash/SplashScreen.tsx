import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CollegeLogo } from '../common/CollegeLogo';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { setActiveTab, currentUser } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (currentUser) {
              setActiveTab('dashboard');
            } else {
              setActiveTab('landing');
            }
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [currentUser, setActiveTab]);

  const handleSkip = () => {
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('landing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Animated Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Main Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center z-10 text-center max-w-lg"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-28 h-28 rounded-full border-2 border-dashed border-amber-400/50 absolute -inset-2"
          />
          <div className="p-3 bg-white rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center">
            <CollegeLogo size="xl" variant="icon-only" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 fill-current text-white" />
          </span>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-[10px] badge-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-3 inline-block">
            Adithya Institute of Technology
          </span>
          <h1 className="text-3xl sm:text-5xl heading-hero mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
            College Asset Monitoring System
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium mb-8">
            Smart Asset Tracking & Maintenance Platform
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-3 p-0.5 border border-slate-700/50 shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeInOut' }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-slate-500 font-mono mb-8">
          <span>Loading System Assets...</span>
          <span>{progress}%</span>
        </div>

        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-slate-800/60 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl"
        >
          Skip Intro <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-xs text-slate-500">
        Adithya Institute of Technology, Coimbatore • CAMS v2.5
      </div>
    </div>
  );
};
