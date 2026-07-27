import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyOTPUser, clearAuthError } from '../../store/slices/authSlice';
import { authApi } from '../../services/api/authApi';
import SendIcon from '@mui/icons-material/Send';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CircularProgress from '@mui/material/CircularProgress';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = React.memo(({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState<number>(60);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useAppDispatch();
  const { otpPendingEmail, isLoading, error } = useAppSelector((state) => state.auth);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Shake modal on error
  useEffect(() => {
    if (error) {
      setShouldShake(true);
      const timeout = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Focus first input box on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  const fullOtp = digits.join('');

  const submitOTP = useCallback(
    (codeToSubmit: string) => {
      if (otpPendingEmail && codeToSubmit.length === 6) {
        dispatch(verifyOTPUser({ email: otpPendingEmail, otp_code: codeToSubmit }))
          .unwrap()
          .then(() => {
            onClose();
            navigate('/planner');
          })
          .catch(() => setShouldShake(true));
      }
    },
    [dispatch, otpPendingEmail, onClose, navigate]
  );

  const handleDigitChange = (index: number, value: string) => {
    dispatch(clearAuthError());

    // Allow only numeric input
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...digits];

    // Handling pasted multi-digit string (e.g. 6-digit code)
    if (cleanValue.length > 1) {
      const pastedChars = cleanValue.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setDigits(newDigits);

      const nextFocus = Math.min(pastedChars.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (newDigits.join('').length === 6) {
        submitOTP(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleanValue.slice(-1);
    setDigits(newDigits);

    // Auto-advance focus to next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if complete
    if (newDigits.join('').length === 6) {
      submitOTP(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (!otpPendingEmail || timer > 0) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await authApi.resendOTP(otpPendingEmail);
      setResendStatus('New 6-digit verification code sent.');
      setTimer(60);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setResendStatus('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={
            shouldShake
              ? { x: [-12, 12, -8, 8, -4, 4, 0], scale: 1, opacity: 1 }
              : { scale: 1, opacity: 1, y: 0 }
          }
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative overflow-hidden text-center"
        >
          {/* Telegram Animated Header Icon */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-500 rounded-3xl shadow-lg shadow-teal-500/30 flex items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform">
              <SendIcon sx={{ fontSize: 38 }} className="ml-1 -mt-1" />
            </div>
            <div className="absolute -bottom-2 bg-teal-400 text-slate-950 p-1.5 rounded-full border-2 border-white shadow">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
            </div>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            Check Your Email
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            We sent a 6-digit confirmation code to<br />
            <strong className="text-teal-700 font-bold">{otpPendingEmail}</strong>
          </p>

          {/* Feedback Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-700 text-xs font-semibold p-2.5 rounded-xl border border-red-200 mt-4"
            >
              {error}
            </motion.div>
          )}

          {resendStatus && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-teal-50 text-teal-800 text-xs font-semibold p-2.5 rounded-xl border border-teal-200 mt-4"
            >
              {resendStatus}
            </motion.div>
          )}

          {/* Telegram 6-Digit PIN Grid ([x][x][x] - [x][x][x]) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitOTP(fullOtp);
            }}
            className="mt-6 space-y-6"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {digits.slice(0, 3).map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-extrabold rounded-2xl border-2 transition-all outline-none ${
                    digit
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10'
                  }`}
                />
              ))}

              <span className="text-slate-300 font-bold px-0.5">-</span>

              {digits.slice(3, 6).map((digit, index) => {
                const idx = index + 3;
                return (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-extrabold rounded-2xl border-2 transition-all outline-none ${
                      digit
                        ? 'border-teal-600 bg-teal-50/50 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10'
                    }`}
                  />
                );
              })}
            </div>

            {/* Main Action Button */}
            <button
              type="submit"
              disabled={isLoading || fullOtp.length !== 6}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <span>Confirm Verification</span>
              )}
            </button>
          </form>

          {/* Telegram Resend Timer & Actions */}
          <div className="mt-6 flex flex-col items-center gap-2">
            {timer > 0 ? (
              <p className="text-xs text-slate-400 font-medium">
                Resend code in <span className="font-bold text-slate-700">00:{timer < 10 ? `0${timer}` : timer}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold transition underline"
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium mt-1 transition"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

OTPModal.displayName = 'OTPModal';
