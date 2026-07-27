import React from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

interface SpinnerOverlayProps {
  message?: string;
}

/**
 * Full-screen translucent overlay with a centered spinner.
 * Used for global loading states (e.g. initial auth check).
 */
export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = React.memo(
  ({ message = 'Loading...' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-xs"
    >
      <CircularProgress size={48} sx={{ color: '#00796b' }} />
      <p className="mt-4 text-sm font-medium text-teal-800 bg-white/80 px-4 py-1.5 rounded-full shadow">
        {message}
      </p>
    </motion.div>
  )
);

SpinnerOverlay.displayName = 'SpinnerOverlay';
