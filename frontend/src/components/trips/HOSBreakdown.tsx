import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TripItem } from '../../services/api/tripApi';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import HotelIcon from '@mui/icons-material/Hotel';

interface HOSBreakdownProps {
  trip: TripItem;
}

/**
 * HOS Breakdown panel — visualizes the trip's HOS duty cycle calculation.
 * Shows driving hours, rest stops, total distance, and cycle utilization.
 */
export const HOSBreakdown: React.FC<HOSBreakdownProps> = React.memo(({ trip }) => {
  const stats = useMemo(() => {
    const drivingStops = trip.stops?.filter((s) => s.stop_type === 'DRIVING') || [];
    const restStops = trip.stops?.filter(
      (s) => s.stop_type === 'REST' || s.stop_type === 'SLEEP'
    ) || [];
    const totalDriving = drivingStops.reduce((acc, s) => acc + s.duration_hours, 0);
    const totalRest = restStops.reduce((acc, s) => acc + s.duration_hours, 0);
    const cyclePercent = Math.min(
      ((trip.cycle_hours_used + totalDriving) / 70) * 100,
      100
    );

    return { totalDriving, totalRest, restStopCount: restStops.length, cyclePercent };
  }, [trip]);

  const statCards = [
    {
      label: 'Total Distance',
      value: `${trip.total_distance_miles?.toFixed(0) || '—'} mi`,
      icon: <SpeedIcon />,
      color: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Est. Duration',
      value: `${trip.estimated_duration_hours?.toFixed(1) || '—'} hrs`,
      icon: <AccessTimeIcon />,
      color: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Rest Stops',
      value: `${stats.restStopCount}`,
      icon: <HotelIcon />,
      color: 'bg-blue-50 text-blue-700',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
    >
      <h3 className="text-lg font-bold text-slate-900 mb-4">HOS Compliance Breakdown</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} rounded-xl p-4 flex flex-col items-center text-center`}
          >
            {card.icon}
            <span className="text-xs font-medium mt-1 opacity-75">{card.label}</span>
            <span className="text-lg font-bold mt-0.5">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Cycle usage bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">70-Hour Cycle Usage</span>
          <span className="font-bold text-teal-700">{stats.cyclePercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.cyclePercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              stats.cyclePercent > 85 ? 'bg-teal-900' : 'bg-gradient-to-r from-teal-600 to-teal-400'
            }`}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Driving: {stats.totalDriving.toFixed(1)}h</span>
          <span>Rest: {stats.totalRest.toFixed(1)}h</span>
        </div>
      </div>
    </motion.div>
  );
});

HOSBreakdown.displayName = 'HOSBreakdown';
