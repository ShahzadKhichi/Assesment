import React from 'react';
import { Link } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-white/20 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-300 sm:px-6 lg:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white">
            <div className="rounded-xl bg-teal-500/20 p-2 text-teal-300">
              <LocalShippingIcon fontSize="small" />
            </div>
            <span>TripPlanner HOS Pro</span>
          </Link>
          <p className="text-slate-400">
            A polished fleet planning workspace for commercial drivers, combining HOS compliance, route planning,
            and live location guidance in one calm interface.
          </p>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-2">
            <p className="font-semibold uppercase tracking-[0.2em] text-slate-400">Powered by</p>
            <div className="flex items-center gap-2 text-slate-300">
              <RouteIcon fontSize="small" className="text-teal-300" />
              <span>Google Maps demo routing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <EmailOutlinedIcon fontSize="small" className="text-teal-300" />
              <span>Location search suggestions</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold uppercase tracking-[0.2em] text-slate-400">Explore</p>
            <Link to="/planner" className="block text-slate-300 transition hover:text-white">
              Trip Planner
            </Link>
            <Link to="/logs" className="block text-slate-300 transition hover:text-white">
              Daily Logs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
