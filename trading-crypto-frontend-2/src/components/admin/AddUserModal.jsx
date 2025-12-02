// src/components/admin/AddUserModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, InputAdornment, 
  Typography, Divider, Stack, useTheme, CircularProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { registerApi } from "../../api/authApi";
import { useToast } from "../../utils/toast";

export default function AddUserModal({ open, onClose, onSuccess }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024"; 

  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({ username: "", email: "", password: "" });
      setCreating(false);
    }
  }, [open]);

  const handleCreateUser = async () => {
    if(!formData.username || !formData.email || !formData.password) {
        toastWarning("Vui lòng điền đầy đủ thông tin!");
        return;
    }
    setCreating(true);
    try {
        const res = await registerApi(formData);
        if(res.code === 1000) {
            toastSuccess("Tạo người dùng thành công!");
            onSuccess();
            onClose();
        } else {
            toastError(res.message || "Tạo thất bại");
        }
    } catch (err) {
        const msg = err.response?.data?.message || "Lỗi kết nối";
        toastError(msg);
    } finally {
        setCreating(false);
    }
  };

  const textFieldSx = {
    ...(isDark && { "& .MuiOutlinedInput-root": { bgcolor: CUSTOM_DARK_BG } })
  };

  return (
    <Dialog 
      open={open} 
      onClose={!creating ? onClose : undefined} 
      maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none", bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper" } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        {/* 🔥 SỬA LỖI: Thêm component="div" để tránh lỗi h6 trong h2 */}
        <Typography variant="h6" component="div" fontWeight={700}>
            Thêm người dùng mới
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={creating}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2.5}>
            <TextField 
                label="Tên đăng nhập" fullWidth value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})}
                disabled={creating} sx={textFieldSx}
            />
            <TextField 
                label="Email" fullWidth value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={creating} sx={textFieldSx}
            />
            <TextField 
                label="Mật khẩu" fullWidth type={showPass ? "text" : "password"}
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
                disabled={creating} sx={textFieldSx}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                                {showPass ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" fullWidth disabled={creating}>Hủy</Button>
        <Button onClick={handleCreateUser} variant="contained" color="primary" fullWidth disabled={creating} sx={{ fontWeight: 600 }}>
            {creating ? <CircularProgress size={24} color="inherit"/> : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}