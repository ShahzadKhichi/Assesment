import React from 'react';
import { motion } from 'framer-motion';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';

interface TruckLoaderProps {
  message?: string;
}

/**
 * Animated truck-moving-along-route loader.
 * Used when the backend is computing HOS-compliant route schedules.
 */
export const TruckLoader: React.FC<TruckLoaderProps> = React.memo(
  ({ message = 'Calculating HOS Compliant Route...' }) => (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-teal-100 my-6">
      {/* Route track */}
      <div className="relative w-52 h-16 flex items-center justify-between px-2 overflow-hidden border-b-2 border-dashed border-teal-600">
        {/* Animated truck */}
        <motion.div
          animate={{ x: [-24, 172] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="text-teal-700 absolute bottom-1"
        >
          <LocalShippingIcon sx={{ fontSize: 36 }} />
        </motion.div>

        {/* Start & end pins */}
        <div className="text-teal-500 z-10">
          <RouteIcon sx={{ fontSize: 24 }} />
        </div>
        <div className="text-teal-700 z-10">
          <RouteIcon sx={{ fontSize: 24 }} />
        </div>
      </div>

      {/* Pulsing label */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-4 font-semibold text-teal-800 text-sm tracking-wide"
      >
        {message}
      </motion.p>
    </div>
  )
);

TruckLoader.displayName = 'TruckLoader';
