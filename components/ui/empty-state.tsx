import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="py-16 px-6 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]"
    >
      <div className="w-14 h-14 rounded-2xl bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 shadow-inner shadow-purple-500/10">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </motion.div>
  );
}
