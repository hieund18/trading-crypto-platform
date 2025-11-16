// src/api/authApi.js
import axios from "axios";
import api from "./axiosInstance";
import { getRefreshToken, setToken, setRefreshToken } from "./tokenUtils";

// Đổi BASE_URL cho khớp với Identity Service
const BASE_URL = "http://localhost:8888/api/v1/identity";

// ========== AUTH APIs ==========

// Đăng ký
export async function registerApi(payload) {
  // payload: { username, email, password }
  const res = await axios.post(`${BASE_URL}/users/registration`, payload);
  return res.data;
}

// Đăng nhập
export async function loginApi(identifier, password) {
  const res = await axios.post(`${BASE_URL}/auth/token`, {
    identifier,
    password,
  });

  return res.data; // trả về nguyên { code, result }
}

// Quên mật khẩu - gửi OTP tới email
export async function sendForgotPasswordOtpApi(recipient) {
  const res = await axios.post(`${BASE_URL}/users/forgot-password/send-otp`, {
    recipient,
  });
  return res.data; // vd: { message: "OTP sent" }
}

// Xác thực OTP (quên mật khẩu) để lấy resetToken
export async function verifyForgotPasswordOtpApi(email, otp) {
  const res = await axios.post(`${BASE_URL}/users/forgot-password/verify-otp`, {
    recipient: email,
    otpCode: otp,
  });
  // giả sử backend trả: { resetToken: "xxx" }
  return res.data;
}

// Đặt lại mật khẩu bằng resetToken
export async function resetForgotPasswordApi(
  resetToken,
  newPassword,
  confirmPassword
) {
  const res = await api.post(
    `${BASE_URL}/users/forgot-password/reset-password`,
    { resetToken, newPassword, confirmPassword }
  );
  return res.data;
}

// ========== REFRESH TOKEN ==========
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  const res = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const { accessToken, refreshToken: newRefreshToken } = res.data;

  setToken(accessToken);
  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return accessToken;
}

// Gửi lại mã OTP 2FA
export async function send2FaOtpApi(recipient) {
  const res = await axios.post(`${BASE_URL}/auth/2fa/send-otp`, { recipient });

  return res.data;
}

// Xác thực mã OTP 2FA
export async function verify2FaOtpApi(recipient, otpCode) {
  const res = await axios.post(`${BASE_URL}/auth/2fa/verify-otp`, {
    recipient,
    otpCode,
  });

  return res.data;
}

export async function sendVerifyEmailOtpApi(recipient) {
  const res = await axios.post(`${BASE_URL}/auth/verify-email/send-otp`, {
    recipient,
  });

  return res.data;
}

// Xác thực mã OTP 2FA
export async function verifyEmailOtpApi(recipient, otpCode) {
  const res = await axios.post(`${BASE_URL}/auth/verify-email/verify-otp`, {
    recipient,
    otpCode,
  });

  return res.data;
}

export async function getMyInfo() {
  const res = await api.get("/identity/users/my-info");
  return res.data; // { code, result }
}
