import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LoginIcon from '@mui/icons-material/Login';
import mobileLoginImg from '../assets/usefull_images/Mobile-login-bro.png';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(clearAuthError());
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    [dispatch]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(loginUser(form))
        .unwrap()
        .then(() => navigate('/planner'));
    },
    [dispatch, form, navigate]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card grid max-w-4xl w-full grid-cols-1 overflow-hidden md:grid-cols-12"
      >
        {/* Left Side Illustration */}
        <div className="md:col-span-5 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 p-8 text-white flex flex-col justify-between items-center text-center relative overflow-hidden hidden md:flex">
          <div className="z-10">
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider bg-teal-950/60 px-3 py-1 rounded-full border border-teal-600/40">
              DOT Compliance Suite
            </span>
            <h2 className="text-2xl font-black mt-3">Welcome Back, Driver!</h2>
            <p className="text-teal-100 text-xs mt-1">
              Sign in to manage HOS duty cycles, plan routes, and generate ELD logs.
            </p>
          </div>

          <img
            src={mobileLoginImg}
            alt="Mobile Driver Login"
            className="w-56 h-auto my-6 drop-shadow-xl z-10 transform hover:scale-105 transition-transform"
          />

          <div className="text-[10px] text-teal-200/70 font-medium z-10">
            FMCSA 70-Hour / 8-Day Rule Enforcement Core
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-teal-800 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
              <LocalShippingIcon sx={{ fontSize: 32 }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Driver Portal Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">
              Commercial HOS Trip Planning & Compliance
            </p>
          </div>

          {error && (
            <Alert severity="error" className="mb-6" variant="outlined">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              InputProps={{
                startAdornment: (
                  <EmailOutlinedIcon className="mr-2 text-teal-700" fontSize="small" />
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              required
              InputProps={{
                startAdornment: (
                  <LockOutlinedIcon className="mr-2 text-teal-700" fontSize="small" />
                ),
              }}
            />

            <div className="flex justify-end text-xs">
              <Link to="/forgot-password" className="text-teal-700 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              endIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #00796b 0%, #004d40 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00695c 0%, #003d33 100%)',
                },
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-700 font-semibold hover:underline">
              Register Driver
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
