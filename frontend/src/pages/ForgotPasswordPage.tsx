import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { forgotPasswordUser, resetPasswordUser, clearAuthError } from '../store/slices/authSlice';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LockResetIcon from '@mui/icons-material/LockReset';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/planner');
    }
  }, [isAuthenticated, navigate]);

  const handleRequestOTP = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearAuthError());
      const result = await dispatch(forgotPasswordUser(email));
      if (forgotPasswordUser.fulfilled.match(result)) {
        setSuccessMessage('Authorization code sent! Please check your email inbox.');
        setStep(2);
      }
    },
    [dispatch, email]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      dispatch(clearAuthError());
      const result = await dispatch(
        resetPasswordUser({
          email,
          otp_code: otpCode,
          new_password: newPassword,
        })
      );
      if (resetPasswordUser.fulfilled.match(result)) {
        setSuccessMessage('Password reset successfully! Redirecting...');
        setTimeout(() => navigate('/planner'), 1200);
      }
    },
    [dispatch, email, navigate, newPassword, otpCode]
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-white"
      >
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/login"
            className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <ArrowBackIcon fontSize="small" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
              <LockResetIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reset Password</h2>
              <p className="text-xs text-slate-400">Account Recovery</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert severity="error" className="mb-4" variant="filled">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" className="mb-4" icon={<CheckCircleIcon />}>
            {successMessage}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestOTP}
              className="space-y-5"
            >
              <p className="text-sm text-slate-300">
                Enter your registered driver email address to receive a 6-digit password reset authorization code.
              </p>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@logistics.com"
                InputProps={{
                  startAdornment: <EmailIcon className="text-teal-400 mr-2" fontSize="small" />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.3)' },
                    '&:hover fieldset': { borderColor: '#0d9488' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
                  },
                }}
              >
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              <p className="text-sm text-slate-300">
                Enter the 6-digit reset code sent to <strong className="text-teal-400">{email}</strong> and set your new password.
              </p>

              <TextField
                fullWidth
                label="6-Digit Reset OTP"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="e.g. 835466"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: <VpnKeyIcon className="text-amber-400 mr-2" fontSize="small" />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    letterSpacing: '4px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    '& fieldset': { borderColor: 'rgba(245, 158, 11, 0.5)' },
                    '&:hover fieldset': { borderColor: '#f59e0b' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                InputProps={{
                  startAdornment: <LockResetIcon className="text-teal-400 mr-2" fontSize="small" />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.3)' },
                    '&:hover fieldset': { borderColor: '#0d9488' },
                  },
                  '& .MuiInputLabel-root': { color: '#94a3b8' },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
                  },
                }}
              >
                {isLoading ? 'Resetting Password...' : 'Confirm & Update Password'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
