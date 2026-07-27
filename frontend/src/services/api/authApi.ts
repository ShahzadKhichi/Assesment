import { axiosInstance } from './axiosInstance';

export interface SignupPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp_code: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp_code: string;
  new_password: string;
}

export const authApi = {
  signup: async (payload: SignupPayload) => {
    const res = await axiosInstance.post('/auth/signup/', payload);
    return res.data;
  },

  verifyOTP: async (payload: VerifyOTPPayload) => {
    const res = await axiosInstance.post('/auth/verify-otp/', payload);
    return res.data;
  },

  login: async (payload: LoginPayload) => {
    const res = await axiosInstance.post('/auth/login/', payload);
    return res.data;
  },

  resendOTP: async (email: string) => {
    const res = await axiosInstance.post('/auth/resend-otp/', { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await axiosInstance.post('/auth/forgot-password/', { email });
    return res.data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const res = await axiosInstance.post('/auth/reset-password/', payload);
    return res.data;
  },
};
