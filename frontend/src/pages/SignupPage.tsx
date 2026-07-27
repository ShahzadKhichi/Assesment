import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signupUser, clearAuthError } from '../store/slices/authSlice';
import { OTPModal } from '../components/auth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import signUpImg from '../assets/usefull_images/Sign-up-bro.png';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, otpPendingEmail, isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/planner');
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const [isOtpOpen, setIsOtpOpen] = useState(false);

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
      dispatch(signupUser(form))
        .unwrap()
        .then(() => setIsOtpOpen(true));
    },
    [dispatch, form]
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
              Commercial Driver Onboarding
            </span>
            <h2 className="text-2xl font-black mt-3">Start Planning Compliant Trips</h2>
            <p className="text-teal-100 text-xs mt-1">
              Create your account to automate HOS duty status logs and rest stop schedules.
            </p>
          </div>

          <img
            src={signUpImg}
            alt="Driver Signup Registration"
            className="w-56 h-auto my-6 drop-shadow-xl z-10 transform hover:scale-105 transition-transform"
          />

          <div className="text-[10px] text-teal-200/70 font-medium z-10">
            Includes Telegram OTP Verification Security
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-teal-800 to-teal-600 text-white rounded-2xl flex items-center justify-center mb-3 shadow-md">
              <PersonAddOutlinedIcon sx={{ fontSize: 32 }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create Driver Account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign up for commercial trip planning & daily log automation
            </p>
          </div>

          {error && (
            <Alert severity="error" className="mb-6" variant="outlined">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First Name"
                value={form.first_name}
                onChange={handleChange('first_name')}
                InputProps={{
                  startAdornment: (
                    <PersonOutlineIcon className="mr-2 text-teal-700" fontSize="small" />
                  ),
                }}
              />
              <TextField
                label="Last Name"
                value={form.last_name}
                onChange={handleChange('last_name')}
              />
            </div>

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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '0.75rem',
                mt: 2,
                background: 'linear-gradient(135deg, #00796b 0%, #004d40 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00695c 0%, #003d33 100%)',
                },
              }}
            >
              {isLoading ? 'Creating Account...' : 'Register Driver'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-teal-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* OTP Modal trigger after signup */}
        <OTPModal
          isOpen={isOtpOpen || Boolean(otpPendingEmail)}
          onClose={() => setIsOtpOpen(false)}
        />
      </motion.div>
    </div>
  );
};

export default SignupPage;
