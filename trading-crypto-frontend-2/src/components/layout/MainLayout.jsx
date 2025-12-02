// src/components/layout/MainLayout.jsx
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";
import { useAuth } from "../../context/AuthContext";
import SetPasswordDialog from "../auth/SetPasswordDialog";

export default function MainLayout({ children, maxWidth = 1400 }) {
  const { user, login, token } = useAuth();
  const [openSetPass, setOpenSetPass] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra điều kiện
    if (user && user.noPassword === true) {
      // 2. Kiểm tra xem trong phiên làm việc này user đã "Bỏ qua" chưa?
      const sessionKey = `skip_pass_setup_${user.id}`;
      const hasSkipped = sessionStorage.getItem(sessionKey);

      // Nếu chưa bỏ qua thì mới hiện
      if (!hasSkipped) {
        setOpenSetPass(true);
      }
    }
  }, [user]);

  const handleCloseSetPass = async (isSuccess) => {
    setOpenSetPass(false);

    if (isSuccess) {
      // Nếu thành công -> Reload lại user để cập nhật noPassword = false
      if (token) await login(token);
    } else {
      // Nếu bấm "Để sau" hoặc tắt -> Lưu vào Session Storage
      // Để khi F5 không hiện lại nữa.
      if (user) {
        sessionStorage.setItem(`skip_pass_setup_${user.id}`, "true");
      }
    }
  };

  return (
    <Box sx={{ 
      bgcolor: "background.default",
      minHeight: "100vh",
      display: "flex", 
      flexDirection: "column" 
    }}>
      <MainNavbar />

      <Box 
        component="main" 
        sx={{ 
          px: 3, 
          py: 3, 
          width: "100%",
          maxWidth: maxWidth, 
          mx: "auto",      
          flexGrow: 1 
        }}
      >
        {children}
      </Box>

      <MainFooter />

      {/* DIALOG NHẮC TẠO MẬT KHẨU */}
      {user && (
        <SetPasswordDialog 
          open={openSetPass} 
          onClose={handleCloseSetPass} 
        />
      )}
    </Box>
  );
}