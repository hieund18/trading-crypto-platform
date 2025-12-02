// src/pages/auth/Authenticate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { 
  authenticateWithGoogleApi, 
  authenticateWithGithubApi,
  linkGoogleAccountApi,   // 🔥 Import API mới
  linkGithubAccountApi    // 🔥 Import API mới
} from "../../api/authApi";
import { setToken, setRefreshToken } from "../../api/tokenUtils";
import { useToast } from "../../utils/toast";

export default function Authenticate() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");
    const state = params.get("state"); 

    if (authCode) {
      handleAuth(authCode, state);
    } else {
      setIsProcessing(false);
      toastError("Không tìm thấy mã xác thực!");
      nav("/login");
    }
  }, []);

  const handleAuth = async (code, state) => {
    try {
      // 🔥 LOGIC PHÂN LOẠI: LOGIN HAY LINK ACCOUNT
      
      // CASE 1: LINK GOOGLE
      if (state === "google-link") {
        console.log("Linking Google...");
        const res = await linkGoogleAccountApi(code);
        if (res.code === 1000) {
          toastSuccess("Liên kết Google thành công!");
          nav("/settings"); // Quay về trang cài đặt
        } else {
          toastError(res.message || "Liên kết thất bại");
          nav("/settings");
        }
        return; 
      }

      // CASE 2: LINK GITHUB
      if (state === "github-link") {
        console.log("Linking GitHub...");
        const res = await linkGithubAccountApi(code);
        if (res.code === 1000) {
          toastSuccess("Liên kết GitHub thành công!");
          nav("/settings"); // Quay về trang cài đặt
        } else {
          toastError(res.message || "Liên kết thất bại");
          nav("/settings");
        }
        return;
      }

      // CASE 3: LOGIN (Google / GitHub)
      let res;
      if (state === "github") {
        res = await authenticateWithGithubApi(code);
      } else {
        res = await authenticateWithGoogleApi(code);
      }

      if (res.code === 1000) {
        const result = res.result;
        if (result.require2FA === true) {
          toastInfo("Vui lòng nhập OTP 2FA.");
          nav("/two-factor-login", { state: { email: result.recipient } });
          return;
        }

        const { accessToken, refreshToken } = result;
        setToken(accessToken);
        if (refreshToken) setRefreshToken(refreshToken);
        const userInfo = await login(accessToken);

        toastSuccess(`Đăng nhập thành công!`);
        if (userInfo?.roles?.some(r => r.name === "ADMIN")) nav("/admin");
        else nav("/dashboard");

      } else {
        toastError(res.message || "Đăng nhập thất bại");
        nav("/login");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi xử lý xác thực";
      toastError(msg);
      // Nếu đang link mà lỗi thì về settings, đang login mà lỗi thì về login
      if (state?.includes("link")) nav("/settings");
      else nav("/login");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2, bgcolor: "background.default" }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={40} />
        <Typography variant="h6" fontWeight={600} color="text.primary">Đang xử lý...</Typography>
      </Stack>
    </Box>
  );
}