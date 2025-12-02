// src/components/auth/SocialLogin.jsx
import React from "react";
import { Button, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function SocialLogin({ mode = "login" }) {
  const isRegister = mode === "register";

  const googleText = isRegister ? "Đăng ký với Google" : "Đăng nhập với Google";
  const githubText = isRegister ? "Đăng ký với GitHub" : "Đăng nhập với GitHub";

  // Lấy cấu hình từ biến môi trường
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

  const handleGoogle = () => {
    // Thêm state=google
    const targetUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&state=google`;
    window.location.href = targetUrl;
  };

  const handleGithub = () => {
    // Thêm state=github
    const targetUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email&state=github`;
    window.location.href = targetUrl;
  };

  return (
    <Stack spacing={1}>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogle}
        sx={{ color: "text.primary", borderColor: "divider" }}
      >
        {googleText}
      </Button>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GitHubIcon />}
        onClick={handleGithub}
        sx={{ color: "text.primary", borderColor: "divider" }}
      >
        {githubText}
      </Button>
    </Stack>
  );
}