import React, { useState, useEffect } from "react";
import { Typography, Button, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import OtpInput from "../../components/auth/OtpInput";

import { useToast } from "../../utils/toast";
import { send2FaOtpApi, verify2FaOtpApi } from "../../api/authApi";
import { setToken, setRefreshToken } from "../../api/tokenUtils";
import { useAuth } from "../../context/AuthContext";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function TwoFactorLogin() {
  const nav = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const { login } = useAuth();
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

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
    // Dọn dẹp
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Clear error khi nhập đủ 6 số
  useEffect(() => {
    if (otp.length === 6) setError("");
  }, [otp]);

  // =====================================================
  // 🔥 VERIFY OTP 2FA
  // =====================================================
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      const data = await verify2FaOtpApi(email, otp);

      if (data.code !== 1000) {
        toastError(data.message || "Xác thực 2FA thất bại!");
        return;
      }

      // Thành công
      const { accessToken, refreshToken } = data.result;
      setToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      // 🔥 Gọi login trong AuthContext → load my-info
      const userInfo = await login(accessToken);
      if (!userInfo) {
        toastError("Không thể tải thông tin người dùng!");
        return;
      }

      // 🔥 Redirect theo role
      const roles = userInfo.roles?.map((r) => r.name) || [];

      if (roles.includes("ADMIN")) {
        toastSuccess("Đăng nhập Admin thành công!");
        nav("/admin");
      } else {
        toastSuccess("Đăng nhập thành công!");
        nav("/dashboard");
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối tới máy chủ!");
        return;
      }

      const data = err.response.data;

      // ❗ Dùng message từ backend 100%
      toastError(data?.message || "Xác thực 2FA thất bại!");
    }
  };

  // =====================================================
  // 🔥 SEND (RESEND) OTP 2FA
  // =====================================================
  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);

    try {
      const data = await send2FaOtpApi(email);

      if (data.code === 1000) {
        toastSuccess(data.message || "Đã gửi lại mã OTP.");
        setCountdown(60);
      } else {
        toastWarning(data.message || "Không thể gửi lại OTP.");
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối tới máy chủ!");
        return;
      }

      const data = err.response.data;

      // ❗ Dùng message backend trực tiếp
      toastError(data?.message || "Không thể gửi lại OTP.");
    } finally {
      setIsResending(false); // 5. Dừng loading
    }
  };

  return (
    <AuthLayout title="Xác thực 2 bước (2FA)">
      <Stack spacing={2} alignItems="center">
        <Typography color="text.secondary" textAlign="center">
          Vui lòng nhập mã xác thực <b>6 số</b> được gửi tới email:
        </Typography>

        <Typography fontWeight={700} color="#3b82f6">
          {email}
        </Typography>

        <OtpInput value={otp} onChange={setOtp} />

        {error && (
          <Typography color="error" fontSize={14} textAlign="center">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleVerify}
          sx={{ mt: 2, bgcolor: "#3b82f6" }}
        >
          Xác nhận đăng nhập
        </Button>

        <Button
          fullWidth
          onClick={handleResend}
          // 7. Vô hiệu hóa nút
          disabled={countdown > 0 || isResending}
        >
          {isResending
            ? "Đang gửi..."
            : countdown > 0
            ? `Gửi lại sau (${formatTime(countdown)})` // 8. Hiển thị đếm ngược
            : "Gửi lại mã OTP"}
        </Button>

        <Button fullWidth onClick={() => nav("/login")}>
          Quay lại đăng nhập
        </Button>
      </Stack>
    </AuthLayout>
  );
}
