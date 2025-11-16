import React from "react";
import {
  TextField,
  Button,
  Stack,
  Typography,
  Link,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import AuthLayout from "../../components/auth/AuthLayout";
import SocialLogin from "../../components/auth/SocialLogin";
import { registerApi } from "../../api/authApi";
import { useToast } from "../../utils/toast";

// Schema validate
const schema = yup.object({
  username: yup
    .string()
    .required("Tên đăng nhập không được bỏ trống")
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự"),

  email: yup
    .string()
    .required("Email không được bỏ trống")
    .email("Email không hợp lệ"),

  password: yup
    .string()
    .required("Mật khẩu không được bỏ trống")
    .min(8, "Mật khẩu tối thiểu 8 ký tự"),

  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu không khớp"),
});

export default function Register() {
  const { toastSuccess, toastError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const nav = useNavigate();

  const onSubmit = async (data) => {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
      };

      const res = await registerApi(payload);

      if (res.code !== 1000) {
        toastError(res.message || "Đăng ký thất bại!");
        return;
      }

      toastSuccess("Đăng ký thành công! Vui lòng xác thực email.");

      // CHUYỂN SANG TRANG VERIFY EMAIL
      nav("/verify-email", { state: { email: data.email } });

    } catch (err) {
      if (!err.response) {
        toastError("Không thể kết nối tới máy chủ!");
        return;
      }

      const backend = err.response.data;

      // Dùng message backend trực tiếp
      toastError(backend.message || "Không thể đăng ký!");
    }
  };

  return (
    <AuthLayout title="Tạo tài khoản Bitstorm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {/* USERNAME */}
          <TextField
            label="Tên đăng nhập"
            fullWidth
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          {/* EMAIL */}
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
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

          {/* CONFIRM PASSWORD */}
          <TextField
            label="Xác nhận mật khẩu"
            type="password"
            fullWidth
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          {/* SUBMIT */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              bgcolor: "#3b82f6",
              fontWeight: 600,
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>

          <Divider sx={{ my: 1, color: "white" }}>hoặc</Divider>

          <SocialLogin mode="register" />

          <Typography textAlign="center" mt={2} color="white">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 600 }}
            >
              Đăng nhập
            </Link>
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
