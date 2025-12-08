// src/pages/auth/Login.jsx
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

import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../api/authApi";
import { setToken, setRefreshToken } from "../../api/tokenUtils";
import { useToast } from "../../utils/toast";

const schema = yup.object({
  username: yup
    .string()
    .required("Vui lòng nhập email hoặc tên đăng nhập")
    .min(3, "Tối thiểu 3 ký tự"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

export default function Login() {
  const nav = useNavigate();
  const location = useLocation(); 
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
      if (result.requireVerifyEmail === true) {
        toastInfo("Vui lòng xác thực email trước khi tiếp tục.");
        nav("/verify-email", { state: { email: result.recipient } });
        return;
      }
      if (result.require2FA === true) {
        toastInfo("Vui lòng nhập mã OTP 2FA.");
        nav("/two-factor-login", { state: { email: result.recipient } });
        return;
      }

      const { accessToken, refreshToken } = result;
      setToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      const userInfo = await login(accessToken);
      if (!userInfo) {
        toastError("Không thể tải thông tin người dùng!");
        return;
      }

      toastSuccess("Đăng nhập thành công!");

      // LOGIC CHUYỂN HƯỚNG
      if (location.state?.from) {
        nav(location.state.from.pathname + location.state.from.search);
      } else {
        const roles = userInfo.roles?.map((r) => r.name) || [];
        if (roles.includes("ADMIN")) {
          nav("/admin");
        } else {
          // 🔥 3. CHUYỂN ĐẾN TRANG THỊ TRƯỜNG THAY VÌ DASHBOARD
          nav("/markets"); 
        }
      }
    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối tới máy chủ!");
        return;
      }
      const data = err.response.data;
      toastError(data?.message || "Đăng nhập thất bại!");
    }
  };

  return (
    <AuthLayout title="Đăng nhập vào Bitstorm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {apiError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}
          <TextField
            label="Email / Tên đăng nhập"
            fullWidth
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            sx={{ py: 1.2, fontSize: "16px", fontWeight: 600 }}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <Link
            href="/forgot-password"
            underline="hover"
            sx={{ color: "primary.main", alignSelf: "flex-end" }}
          >
            Quên mật khẩu?
          </Link>
          <Divider sx={{ my: 1, color: "text.secondary" }}>hoặc</Divider>
          <SocialLogin />
          <Typography textAlign="center" mt={2} color="text.primary">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              underline="hover"
              sx={{ color: "primary.main", fontWeight: 600 }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}