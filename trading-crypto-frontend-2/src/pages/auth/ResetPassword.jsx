// src/pages/auth/ResetPassword.jsx

import React, { useEffect } from "react"; // 1. Import useEffect
import { TextField, Button, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { resetForgotPasswordApi } from "../../api/authApi";
import { useToast } from "../../utils/toast";

// ⭐ Yup schema (Giữ nguyên)
const schema = yup.object({
  password: yup
    .string()
    .required("Mật khẩu không được bỏ trống")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

export default function ResetPassword() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { toastSuccess, toastError, toastWarning } = useToast(); // 2. Thêm toastWarning

  const resetToken = state?.resetToken;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // 🚀 Gọi API reset password (Giữ nguyên)
  const onSubmit = async (data) => {
    if (!resetToken) {
      // Logic này vẫn giữ lại như một lớp bảo vệ thứ 2
      toastError("Không tìm thấy mã xác thực! Hãy thử lại từ đầu.");
      nav("/forgot-password", { replace: true });
      return;
    }

    try {
      const response = await resetForgotPasswordApi(
        resetToken,
        data.password,
        data.confirmPassword
      );

      if (response.code === 1000) {
        toastSuccess("Đặt lại mật khẩu thành công!");
        nav("/login", { replace: true }); // Thêm replace: true cho rõ ràng
      } else {
        toastError(response.message || "Không thể đặt lại mật khẩu!");
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối tới máy chủ!");
        return;
      }
      const backend = err.response.data;
      toastError(backend.message || "Đặt lại mật khẩu thất bại!");
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <AuthLayout title="Đặt lại mật khẩu">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{
              py: 1.2,
              // bgcolor: "#3b82f6",
              // ":hover": { bgcolor: "#2563eb" },
            }}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>

          <Button
            fullWidth
            onClick={() => nav("/login")}
            sx={{ color: "primary.main", fontWeight: 600 }}
          >
            Quay lại đăng nhập
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}