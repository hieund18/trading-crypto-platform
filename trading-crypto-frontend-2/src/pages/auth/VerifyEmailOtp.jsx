import React, { useState, useEffect } from "react";
import { Typography, Button, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import OtpInput from "../../components/auth/OtpInput";
import { useToast } from "../../utils/toast";

import { sendVerifyEmailOtpApi, verifyEmailOtpApi } from "../../api/authApi";

import { setToken, setRefreshToken } from "../../api/tokenUtils";
import { useAuth } from "../../context/AuthContext";

// Format 60 → 01:00
const formatTime = (sec) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function VerifyEmailOtp() {
  const nav = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const { toastSuccess, toastError, toastWarning } = useToast();
  const { login } = useAuth(); // <-- dùng login của AuthContext

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // AUTO-START COUNTDOWN
  useEffect(() => {
    setCountdown(60);
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (val) => {
    setOtp(val);
    if (val.length === 6) setError("");
  };

  // ==========================================================
  // 🔥 VERIFY EMAIL OTP + LOGIN USER
  // ==========================================================
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      const response = await verifyEmailOtpApi(email, otp);

      if (response.code !== 1000) {
        toastError(response.message || "OTP không hợp lệ!");
        return;
      }

      const { accessToken, refreshToken } = response.result;

      // Lưu token
      setToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      // Gọi login → load my-info
      const user = await login(accessToken);

      toastSuccess("Xác thực email thành công!");

      // Điều hướng theo role
      const roles = user?.roles?.map((r) => r.name) || [];

      if (roles.includes("ADMIN")) {
        nav("/admin", { replace: true });
      } else {
        nav("/dashboard", { replace: true });
      }
    } catch (err) {
      const backend = err.response?.data;
      toastError(backend?.message || "Không thể xác thực OTP!");
    }
  };

  // ==========================================================
  // 🔥 RESEND OTP
  // ==========================================================
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await sendVerifyEmailOtpApi(email);

      if (response.code === 1000) {
        toastSuccess("Đã gửi lại OTP Email!");
        setCountdown(60);
      } else {
        toastError(response.message || "Không thể gửi lại OTP!");
      }
    } catch (err) {
      const backend = err.response?.data;

      if (backend?.code === 1004) {
        toastWarning(backend.message || "Bạn gửi quá nhiều yêu cầu!");
      } else {
        toastError(backend?.message || "Không thể gửi lại OTP!");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title="Xác thực Email">
      <Stack spacing={2} alignItems="center">
        <Typography color="text.secondary" textAlign="center">
          Nhập mã gồm <b>6 số</b> đã gửi đến email:
        </Typography>

        <Typography fontWeight={700} color="primary.main">
          {email}
        </Typography>

        <OtpInput value={otp} onChange={handleOtpChange} />

        {error && (
          <Typography color="error" fontSize={14} textAlign="center" mt={1}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleVerify}
          sx={{ mt: 2 }}
        >
          Xác nhận
        </Button>

        <Button
          fullWidth
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          sx={{ opacity: countdown > 0 ? 0.5 : 1, color: "primary.main" }}
        >
          {isResending
            ? "Đang gửi..."
            : countdown > 0
            ? `Gửi lại sau (${formatTime(countdown)})`
            : "Gửi lại mã OTP"}
        </Button>

        <Button
          fullWidth
          onClick={() => nav("/login")}
          sx={{ color: "primary.main" }}
        >
          Quay lại đăng nhập
        </Button>
      </Stack>
    </AuthLayout>
  );
}
