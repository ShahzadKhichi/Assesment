import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

export const Navbar: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = React.useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-slate-950/80 backdrop-blur-xl text-white shadow-[0_10px_40px_-20px_rgba(2,6,23,0.7)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight transition hover:opacity-90">
          <div className="rounded-2xl bg-teal-400/15 p-2 text-teal-200 shadow-sm ring-1 ring-white/15">
            <LocalShippingIcon sx={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="text-lg">TripPlanner</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-teal-300">HOS Pro</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated && (
            <>
              <Link
                to="/planner"
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive('/planner') ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <RouteIcon fontSize="small" />
                <span>Trip Planner</span>
              </Link>
              <Link
                to="/logs"
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive('/logs') ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <AssignmentIcon fontSize="small" />
                <span>ELD Daily Logs</span>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-slate-100 sm:inline">
                {user?.email || 'Driver Account'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/15"
              >
                <LogoutIcon fontSize="small" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-teal-300"
            >
              <LoginIcon fontSize="small" />
              <span>Driver Sign In</span>
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white md:hidden"
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAuthenticated && mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-950/80 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-60 min-h-screen w-[85vw] max-w-xs overflow-hidden border-r border-teal-600/30 bg-slate-950/95 p-5 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between pb-4">
                <div className="text-lg font-semibold text-teal-200">Menu</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full bg-teal-600/20 p-2 text-white hover:bg-teal-500/25"
                  aria-label="Close navigation"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/planner"
                  className="flex items-center gap-3 rounded-2xl border border-teal-600/20 bg-teal-700/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-700/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <RouteIcon fontSize="small" />
                  <span>Trip Planner</span>
                </Link>
                <Link
                  to="/logs"
                  className="flex items-center gap-3 rounded-2xl border border-teal-600/20 bg-teal-700/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-700/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AssignmentIcon fontSize="small" />
                  <span>ELD Daily Logs</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
});

Navbar.displayName = 'Navbar';
