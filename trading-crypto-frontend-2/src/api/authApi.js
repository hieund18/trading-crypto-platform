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

//logout
export async function logoutApi(refreshToken) {
  const res = await axios.post(`${BASE_URL}/auth/logout`, {
    refreshToken,
  });
  return res.data; // { "code": 1000 }
}

export async function authenticateWithGoogleApi(code) {
  // Endpoint: /identity/auth/outbound/authentication?code=...
  const res = await api.post(`/identity/auth/outbound/authentication?code=${code}`);
  return res.data;
}

// 2. API xác thực GitHub (MỚI)
export async function authenticateWithGithubApi(code) {
  // Endpoint riêng cho GitHub như bạn yêu cầu
  const res = await api.post(`/identity/auth/github/authentication?code=${code}`);
  return res.data;
}

// 🔥 API Liên kết tài khoản Google
export async function linkGoogleAccountApi(code) {
  const res = await api.post(`/identity/auth/outbound/link?code=${code}`);
  return res.data;
}

// 🔥 API Liên kết tài khoản GitHub
export async function linkGithubAccountApi(code) {
  const res = await api.post(`/identity/auth/github/link?code=${code}`);
  return res.data;
}

// API đăng ký Username/Password cho tài khoản Social
export async function registerLocalLoginApi(data) {
  // data: { username, password }
  const res = await api.post("/identity/users/register-local-login", data);
  return res.data;
}

export async function getMyInfo() {
  const res = await api.get("/identity/users/my-info");
  return res.data; // { code, result }
}

export async function changePasswordApi(data) {
  // data input: { oldPassword, newPassword, confirmPassword }
  
  // Map lại key cho đúng yêu cầu backend: currentPassword
  const payload = {
    currentPassword: data.oldPassword, 
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword
  };

  const res = await api.post("/identity/users/change-password", payload);
  return res.data;
}

// 2. Bật/Tắt 2FA
export async function update2FaStatusApi(enable) {
  // Vì là method PATCH, thường sẽ gửi body là trạng thái mong muốn
  // Payload: { twoFactorEnabled: true/false }
  const res = await api.patch("/identity/users/me/2fa", {
    twoFactorEnabled: enable
  });
  return res.data;
}