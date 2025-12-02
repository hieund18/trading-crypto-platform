// src/components/auth/SetPasswordDialog.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Stack, IconButton,
  InputAdornment, useTheme, Divider
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";

import { registerLocalLoginApi } from "../../api/authApi";
import { useToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

export default function SetPasswordDialog({ open, onClose }) {
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  
  // 1. Lấy theme để xử lý Dark Mode giống TransferDialog
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024"; // Màu nền bạn thích

  const [formData, setFormData] = useState({
    username: user?.username || "",
    password: ""
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Style input cho Dark Mode
  const textFieldSx = {
    ...(isDark && {
      "& .MuiOutlinedInput-root": {
        bgcolor: CUSTOM_DARK_BG, 
      }
    })
  };

  const handleSubmit = async () => {
    if (formData.username.length < 3 || formData.password.length < 3) {
      toastError("Tài khoản và mật khẩu tối thiểu 3 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await registerLocalLoginApi(formData);
      if (res.code === 1000) {
        toastSuccess("Tạo mật khẩu thành công!");
        onClose(true); // true = đã update thành công
      } else {
        toastError(res.message || "Tạo mật khẩu thất bại");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi kết nối";
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth 
      disableEscapeKeyDown
      // 2. Áp dụng Style nền Dialog
      PaperProps={{ 
        sx: { 
            borderRadius: 3,
            backgroundImage: "none",
            bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper",
        } 
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Thiết lập mật khẩu
        </Typography>
        {/* Nút đóng */}
        <IconButton onClick={() => onClose(false)} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          {/* 3. Nội dung chung chung (không nhắc Google/Github cụ thể) */}
          <Typography variant="body2" color="text.secondary">
            Tài khoản liên kết của bạn chưa có mật khẩu. Hãy thiết lập để có thể đăng nhập bằng <b>Tên đăng nhập</b> & <b>Mật khẩu</b> sau này.
          </Typography>

          <TextField
            label="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            fullWidth
            disabled={loading}
            sx={textFieldSx}
          />

          <TextField
            label="Mật khẩu mới"
            type={showPass ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            fullWidth
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                    {showPass ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={textFieldSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
            onClick={() => onClose(false)} 
            variant="outlined" 
            color="inherit" 
            fullWidth 
            disabled={loading}
        >
          Để sau
        </Button>
        <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={handleSubmit} 
            disabled={loading}
            sx={{ fontWeight: 600 }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}