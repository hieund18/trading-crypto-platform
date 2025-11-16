import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Stack,
  Link,
  Divider,
  Typography,
  Alert,
} from "@mui/material";
import AuthLayout from "../../components/auth/AuthLayout";
import SocialLogin from "../../components/auth/SocialLogin";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../api/authApi";
import { setToken, setRefreshToken } from "../../api/tokenUtils";

import { useToast } from "../../utils/toast";

// 🎯 Yup validation
const schema = yup.object({
  username: yup
    .string()
    .required("Vui lòng nhập email hoặc tên đăng nhập")
    .min(3, "Tối thiểu 3 ký tự"),

  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState("");
  const { toastSuccess, toastError, toastInfo } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setApiError("");

    try {
      const response = await loginApi(data.username, data.password);
      if (response.code !== 1000) {
        toastError(response.message || "Đăng nhập thất bại!");
        return;
      }

      const result = response.result;

      // 🔥 Nếu user chưa verify email
      if (result.requireVerifyEmail === true) {
        toastInfo("Vui lòng xác thực email trước khi tiếp tục.");
        nav("/verify-email", { state: { email: result.recipient } });
        return;
      }

      // 🔥 Nếu cần 2FA
      if (result.require2FA === true) {
        toastInfo("Vui lòng nhập mã OTP 2FA.");
        nav("/two-factor-login", { state: { email: result.recipient } });
        return;
      }

      // 🔥 Nhận token → lưu vào localStorage
      const { accessToken, refreshToken } = result;
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

  return (
    <AuthLayout title="Đăng nhập vào Bitstorm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {/* 🔥 Khay thông báo lỗi API */}
          {apiError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}

          {/* USERNAME */}
          <TextField
            label="Email / Tên đăng nhập"
            fullWidth
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          {/* PASSWORD */}
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          {/* LOGIN BUTTON */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              py: 1.2,
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <Link
            href="/forgot-password"
            underline="hover"
            sx={{ color: "#3b82f6", alignSelf: "flex-end" }}
          >
            Quên mật khẩu?
          </Link>

          <Divider sx={{ my: 1, color: "white" }}>hoặc</Divider>

          <SocialLogin />

          <Typography textAlign="center" mt={2} color="white">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 600 }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
