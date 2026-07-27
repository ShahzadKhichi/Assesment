import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, ResetPasswordPayload, SignupPayload, VerifyOTPPayload } from '../../services/api/authApi';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
}

interface AuthState {
  user: User | null;
  tokens: { access: string; refresh: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpPendingEmail: string | null;
  resetPasswordSuccess: boolean;
}

const initialAccessToken = localStorage.getItem('access_token');

const initialState: AuthState = {
  user: null,
  tokens: initialAccessToken ? { access: initialAccessToken, refresh: '' } : null,
  isAuthenticated: Boolean(initialAccessToken),
  isLoading: false,
  error: null,
  otpPendingEmail: null,
  resetPasswordSuccess: false,
};

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (payload: SignupPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.signup(payload);
      return { email: payload.email, message: response.data?.message };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyOTPUser = createAsyncThunk(
  'auth/verifyOTP',
  async (payload: VerifyOTPPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOTP(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const forgotPasswordUser = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const resetPasswordUser = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.otpPendingEmail = null;
      state.resetPasswordSuccess = false;
      localStorage.removeItem('access_token');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setOTPPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.otpPendingEmail = action.payload;
    },
    clearResetPasswordSuccess: (state) => {
      state.resetPasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpPendingEmail = action.payload.email;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify OTP
      .addCase(verifyOTPUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTPUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.otpPendingEmail = null;
        localStorage.setItem('access_token', action.payload.tokens.access);
      })
      .addCase(verifyOTPUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        localStorage.setItem('access_token', action.payload.tokens.access);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Forgot Password
      .addCase(forgotPasswordUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPasswordUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.resetPasswordSuccess = true;
        localStorage.setItem('access_token', action.payload.tokens.access);
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError, setOTPPendingEmail, clearResetPasswordSuccess } = authSlice.actions;
export default authSlice.reducer;
