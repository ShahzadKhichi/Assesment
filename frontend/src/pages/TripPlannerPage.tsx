import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { TripPlannerForm, HOSBreakdown, RouteTimeline, RouteMap } from '../components/trips';
import { FuelCalculatorWidget } from '../components/trips/FuelCalculatorWidget';
import { TruckLoader } from '../components/loaders';
import RouteIcon from '@mui/icons-material/Route';
import paperMapImg from '../assets/usefull_images/Paper-map-cuate.png';

const TripPlannerPage: React.FC = () => {
  const { isPlanning, activeTrip } = useAppSelector((state) => state.trips);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass-card relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 p-6 text-white sm:p-8 md:flex md:items-center md:justify-between"
      >
        <div className="space-y-2 z-10 max-w-xl">
          <span className="glass-pill border-teal-500/30 bg-teal-950/40 text-teal-200">
            FMCSA HOS Compliance Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Commercial Trip & Route Planner
          </h1>
          <p className="text-teal-100 text-sm">
            Input your current location, pickup, dropoff, and current 70-hour cycle to automatically generate compliant driving shifts, required 30-min breaks, and 10-hour rest stops.
          </p>
        </div>

        <div className="z-10 flex-shrink-0">
          <img
            src={paperMapImg}
            alt="Commercial Route Mapping"
            className="w-48 sm:w-56 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform"
          />
        </div>
      </motion.div>

      {/* Grid Layout: Form on Left, Output (Map + HOS + Timeline) on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 space-y-6">
          <TripPlannerForm />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isPlanning && <TruckLoader message="Computing HOS Compliant Route & Rest Stops..." />}

          {!isPlanning && activeTrip && (
            <div className="space-y-6">
              <RouteMap trip={activeTrip} />
              <FuelCalculatorWidget totalDistanceMiles={activeTrip.total_distance_miles || 0} />
              <HOSBreakdown trip={activeTrip} />
              <RouteTimeline stops={activeTrip.stops || []} />
            </div>
          )}

          {!isPlanning && !activeTrip && (
            <div className="glass-card flex flex-col items-center justify-center space-y-4 p-10 text-center">
              <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center">
                <RouteIcon sx={{ fontSize: 36 }} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Ready to Plan Your Route?</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Enter your start location, cargo pickup point, and destination on the left to calculate full HOS compliant driving schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;
