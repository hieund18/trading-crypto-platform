import React from "react";
import {
  Typography,
  TextField,
  Button,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthLayout from "../../components/auth/AuthLayout";
import { sendForgotPasswordOtpApi } from "../../api/authApi";
import { useToast } from "../../utils/toast";

// ⭐ Yup validation schema
const schema = yup.object({
  email: yup
    .string()
    .required("Email không được bỏ trống")
    .email("Email không hợp lệ"),
});

export default function ForgotPassword() {
  const nav = useNavigate();
  const { toastSuccess, toastError, toastWarning } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (data) => {
    try {
      // GỌI API GỬI OTP
      const response = await sendForgotPasswordOtpApi(data.email);

      if (response.code === 1000) {
        toastSuccess("Đã gửi mã OTP đến email của bạn!");
        nav("/verify-otp", { state: { email: data.email } });
      } else {
        toastError(response.message || "Không thể gửi OTP!");
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối máy chủ!");
        return;
      }

      const backend = err.response.data;

      // Rate limit
      if (backend.code === 1004) {
        toastWarning(backend.message || "Bạn đã gửi quá nhiều yêu cầu!");
      } else {
        toastError(backend.message || "Không thể gửi OTP!");
      }
    }
  };

  return (
    <AuthLayout title="Quên mật khẩu">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {/* Mô tả */}
          <Typography color="text.secondary">
            Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
          </Typography>

          {/* EMAIL INPUT */}
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          {/* BUTTON GỬI OTP */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{
              py: 1.2,
              // backgroundColor: "#3b82f6",
              // ":hover": { backgroundColor: "#2563eb" },
              fontWeight: 600,
              fontSize: 16
            }}
          >
            {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
          </Button>

          {/* Back to login */}
          <Button
            fullWidth
            onClick={() => nav("/login")}
            sx={{
              color: "primary.main",
              fontWeight: 600,
              mt: 1
            }}
          >
            Quay lại đăng nhập
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}
