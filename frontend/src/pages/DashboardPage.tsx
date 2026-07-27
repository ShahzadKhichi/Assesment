import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTrips } from '../store/slices/tripSlice';
import { TripListShimmer } from '../components/shimmer';
import RouteIcon from '@mui/icons-material/Route';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import journeyImg from '../assets/usefull_images/Journey-amico.png';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { trips, isLoading } = useAppSelector((state) => state.trips);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass-card relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-slate-900 p-6 text-white sm:p-8 md:flex md:items-center md:justify-between md:gap-16"
      >
        <div className="space-y-3 z-10 max-w-xl">
          <span className="glass-pill border-teal-500/30 bg-teal-950/40 text-teal-200">
            FMCSA HOS Fleet Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || 'Driver'}!
          </h1>
          <p className="text-teal-100 text-sm">
            Commercial Fleet Overview & FMCSA Duty Compliance Tracking. Manage your 70-hour/8-day rolling cycle easily.
          </p>
          <div className="pt-2">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
            >
              <AddIcon />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>

        <div className="z-10 flex-shrink-0 rounded-3xl border border-white/20 bg-white/10 p-3 mt-6 backdrop-blur">
          <img
            src={journeyImg}
            alt="Trucking Journey"
            className="w-56 sm:w-64 h-auto drop-shadow-2xl transform hover:scale-105 transition-transform"
          />
        </div>
      </motion.div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Link
            to="/planner"
            className="glass-card flex items-center gap-4 p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <RouteIcon sx={{ fontSize: 32 }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Trip Planner Engine
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Calculate compliant driving shifts and rest schedules instantly.
              </p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Link
            to="/logs"
            className="glass-card flex items-center gap-4 p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <AssignmentIcon sx={{ fontSize: 32 }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                ELD Daily Logs
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Access generated 24-hour log sheets and export PDF reports.
              </p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <LocalShippingIcon className="text-teal-700" />
          Recent Trip Plans
        </h2>

        {isLoading && <TripListShimmer count={3} />}

        {!isLoading && trips.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-slate-500">No trips recorded yet. Click "Plan New Trip" above to get started!</p>
          </div>
        )}

        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}`}
                className="glass-card space-y-3 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    {trip.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-slate-800 font-medium">
                    <span className="text-slate-400">From:</span> {trip.current_location}
                  </p>
                  <p className="text-slate-800 font-medium">
                    <span className="text-slate-400">Pickup:</span> {trip.pickup_location}
                  </p>
                  <p className="text-slate-800 font-medium">
                    <span className="text-slate-400">Dropoff:</span> {trip.dropoff_location}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                  <span>{trip.total_distance_miles?.toFixed(0) || '0'} miles</span>
                  <span>{trip.estimated_duration_hours?.toFixed(1) || '0'} hrs total</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
