import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StopItem } from '../../services/api/tripApi';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaceIcon from '@mui/icons-material/Place';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FlagIcon from '@mui/icons-material/Flag';
import FuelIcon from '@mui/icons-material/LocalGasStation';

interface RouteTimelineProps {
  stops: StopItem[];
}

const STOP_ICON_MAP: Record<string, React.ReactNode> = {
  PICKUP: <PlaceIcon fontSize="small" />,
  DROPOFF: <FlagIcon fontSize="small" />,
  REST: <RestaurantIcon fontSize="small" />,
  SLEEP: <HotelIcon fontSize="small" />,
  FUEL: <FuelIcon fontSize="small" />,
  DRIVING: <LocalShippingIcon fontSize="small" />,
};

const STOP_COLOR_MAP: Record<string, string> = {
  PICKUP: 'bg-teal-50 text-teal-700 border-teal-200',
  DROPOFF: 'bg-slate-100 text-slate-700 border-slate-300',
  REST: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  SLEEP: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  FUEL: 'bg-slate-100 text-slate-700 border-slate-300',
  DRIVING: 'bg-teal-100 text-teal-700 border-teal-300',
};

/**
 * RouteTimeline — vertical timeline of scheduled stops in sequence.
 */
export const RouteTimeline: React.FC<RouteTimelineProps> = React.memo(({ stops }) => {
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.sequence - b.sequence),
    [stops]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-5">Route Stop Sequence</h3>

      <div className="space-y-0">
        {sortedStops.map((stop, idx) => {
          const isLast = idx === sortedStops.length - 1;
          const colors = STOP_COLOR_MAP[stop.stop_type] || STOP_COLOR_MAP.DRIVING;
          const icon = STOP_ICON_MAP[stop.stop_type] || STOP_ICON_MAP.DRIVING;

          return (
            <motion.div
              key={stop.id || idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-start gap-4"
            >
              {/* Vertical connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${colors}`}
                >
                  {icon}
                </div>
                {!isLast && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-slate-200" />
                )}
              </div>

              {/* Stop info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{stop.location}</p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors}`}
                  >
                    {stop.stop_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Duration: {stop.duration_hours}h
                  {stop.notes && ` · ${stop.notes}`}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

RouteTimeline.displayName = 'RouteTimeline';
