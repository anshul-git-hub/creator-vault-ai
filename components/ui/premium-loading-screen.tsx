'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface PremiumLoadingScreenProps {
  userName: string;
  creatorType: string;
  onComplete: () => void;
}

export default function PremiumLoadingScreen({ userName, creatorType, onComplete }: PremiumLoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  const getLoadingMessage = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('youtube') || t.includes('video')) return 'Organizing your scripts and footage...';
    if (t.includes('writ') || t.includes('blog')) return 'Preparing your notes and drafts...';
    if (t.includes('design')) return 'Loading your creative assets...';
    if (t.includes('dev') || t.includes('tech')) return 'Compiling your resources...';
    if (t.includes('podcast') || t.includes('audio')) return 'Tuning your audio files...';
    return 'Preparing your assets...';
  };

  useEffect(() => {
    // Fill the progress bar over ~1.5 seconds
    const duration = 1500;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        // Wait a tiny bit at 100% before completing
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-[#f4f4f5] overflow-hidden"
    >
      {/* Background ambient glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-900/15 blur-[120px] pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Logo and Pulse */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <motion.div 
            animate={{ 
              boxShadow: ['0px 0px 0px 0px rgba(168,85,247,0)', '0px 0px 40px 10px rgba(168,85,247,0.3)', '0px 0px 0px 0px rgba(168,85,247,0)'] 
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-purple-400" />
          </motion.div>
        </motion.div>

        {/* Titles */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-center mb-12 space-y-2"
        >
          <h1 className="text-4xl font-black text-white tracking-tight">CreatorVault AI</h1>
          <p className="text-lg font-semibold text-purple-300">Your Second Brain</p>
        </motion.div>

        {/* Personalization */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="w-full space-y-6"
        >
          <div className="flex flex-col items-center text-center space-y-1">
            <p className="text-xl font-bold text-white">Welcome back, {userName}</p>
            <p className="text-sm text-zinc-400">{getLoadingMessage(creatorType)}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-xs font-bold text-zinc-500 font-mono">{Math.floor(progress)}%</span>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
