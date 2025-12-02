// src/pages/auth/VerifyOtp.jsx

import React, { useState, useEffect } from "react"; // 1. Import useEffect
import { Typography, Button, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import OtpInput from "../../components/auth/OtpInput";

import {
  verifyForgotPasswordOtpApi,
  sendForgotPasswordOtpApi,
} from "../../api/authApi";
import { useToast } from "../../utils/toast";

// ==========================================================
// 🔥 ĐỊNH DẠNG THỜI GIAN (ví dụ: 60s -> 01:00)
// ==========================================================
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function VerifyOtp() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { toastSuccess, toastError, toastWarning } = useToast();

  const email = state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // 2. Thêm state cho đếm ngược và trạng thái loading
  const [countdown, setCountdown] = useState(0); // Thời gian đếm ngược (giây)
  const [isResending, setIsResending] = useState(false); // Trạng thái đang gọi API

  // ==========================================================
  // 🔥 EFFECT ĐỂ CHẠY ĐỒNG HỒ ĐẾM NGƯỢC
  // ==========================================================
  useEffect(() => {
    setCountdown(60);
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      // Nếu đang đếm ngược, tạo một interval 1 giây
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }

    // Cleanup: Dọn dẹp interval khi component unmount hoặc countdown về 0
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]); // Effect này chỉ chạy lại khi `countdown` thay đổi

  // ⬤ Khi user nhập OTP
  const handleOtpChange = (val) => {
    setOtp(val);
    if (val.length === 6 && error) setError("");
  };

  // ==========================================================
  // 🔥 VERIFY OTP (Không đổi)
  // ==========================================================
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số OTP");
      return;
    }
    // ... (Giữ nguyên logic verify của bạn)
    try {
      const response = await verifyForgotPasswordOtpApi(email, otp);
      if (response.code !== 1000) {
        toastError(response.message || "OTP không hợp lệ!");
        return;
      }
      const resetToken = response.result.resetToken;
      toastSuccess("Xác thực OTP thành công!");
      nav("/reset-password", { state: { email, resetToken } });
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối máy chủ!");
        return;
      }
      const backend = err.response.data;
      toastError(backend.message || "Xác thực OTP thất bại!");
    }
  };

  // ==========================================================
  // 🔥 RESEND OTP (Cập nhật)
  // ==========================================================
  const handleResend = async () => {
    // 4. Không cho bấm nếu đang đếm ngược hoặc đang gọi API
    if (countdown > 0 || isResending) return;

    setIsResending(true); // Bắt đầu loading
    try {
      const response = await sendForgotPasswordOtpApi(email);

      if (response.code === 1000) {
        toastSuccess("Đã gửi lại mã OTP đến email!");
        setCountdown(60); // 5. BẮT ĐẦU ĐẾM NGƯỢC 60 GIÂY
      } else {
        toastError(response.message || "Không thể gửi lại OTP!");
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối máy chủ!");
        return;
      }
      const backend = err.response.data;
      if (backend.code === 1004) {
        toastWarning(backend.message || "Bạn gửi quá nhiều yêu cầu!");
      } else {
        toastError(backend.message || "Không thể gửi lại OTP!");
      }
    } finally {
      setIsResending(false); // 6. Dừng loading
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <AuthLayout title="Xác thực OTP">
      <Stack spacing={2} alignItems="center">
        {/* ... (Phần Typography và OtpInput giữ nguyên) ... */}
        <Typography color="text.secondary" textAlign="center">
          Nhập mã xác thực gồm <b>6 số</b> đã được gửi tới email:
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

        {/* VERIFY */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleVerify}
          sx={{ mt: 2 }}
        >
          Xác nhận
        </Button>

        {/* RESEND */}
        <Button
          fullWidth
          onClick={handleResend}
          sx={{ color: "primary.main" }}
          // 7. Vô hiệu hóa nút khi đang đếm ngược hoặc đang gọi API
          disabled={countdown > 0 || isResending}
        >
          {isResending
            ? "Đang gửi..."
            : countdown > 0
            ? `Gửi lại sau (${formatTime(countdown)})` // 8. Hiển thị đếm ngược
            : "Gửi lại mã OTP"}
        </Button>

        {/* BACK */}
        <Button
          fullWidth
          onClick={() => nav("/forgot-password")}
          sx={{ color: "primary.main" }}
        >
          Quay lại
        </Button>
      </Stack>
    </AuthLayout>
  );
}
