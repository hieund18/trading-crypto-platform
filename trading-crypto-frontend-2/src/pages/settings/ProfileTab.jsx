// src/pages/settings/ProfileTab.jsx
import React, { useState, useEffect } from "react";
import { Paper, Typography, Grid, TextField, Divider, Button, Chip, InputAdornment, useTheme } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// 🔥 1. SỬA ĐƯỜNG DẪN IMPORT (Bớt 1 cấp ../)
import { useToast } from "../../utils/toast";
import { updateUserProfileApi } from "../../api/profileApi";
import { useAuth } from "../../context/AuthContext";
import { getToken } from "../../api/tokenUtils";

export default function ProfileTab({ identity, profile, onRefresh }) {
  const { toastSuccess, toastError } = useToast();
  const { login } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({ fullName: "", dob: "", address: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        dob: profile.dob || "",
        address: profile.address || ""
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const res = await updateUserProfileApi(formData);
      if (res.code === 1000) {
        toastSuccess("Đã lưu thông tin hồ sơ");
        const token = getToken(); if(token) await login(token);
        onRefresh();
      } else toastError(res.message);
    } catch (err) { toastError("Lỗi cập nhật"); } 
    finally { setUpdating(false); }
  };

  const commonPaperSx = {
    borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', overflow: 'hidden', p: 3
  };
  
  const dateInputSx = {
    "& ::-webkit-calendar-picker-indicator": { filter: isDark ? "invert(1)" : "none", cursor: "pointer" }
  };

  return (
    <Paper elevation={0} sx={commonPaperSx}>
      <Typography variant="h6" fontWeight={700} mb={3}>Thông tin cá nhân</Typography>
      
      {/* 🔥 2. SỬA LỖI GRID MUI v6 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Tên đăng nhập" value={identity?.username || ""} fullWidth disabled sx={{ bgcolor: 'action.hover' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Email" value={identity?.email || ""} fullWidth disabled sx={{ bgcolor: 'action.hover' }} 
                InputProps={{ endAdornment: <InputAdornment position="end"><Chip label="Đã xác thực" size="small" color="success" icon={<VerifiedUserIcon />} /></InputAdornment> }} 
            />
        </Grid>
        <Grid size={{ xs: 12 }}><Divider /></Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Họ và tên" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Ngày sinh" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} sx={dateInputSx} />
        </Grid>
        <Grid size={{ xs: 12 }}>
            <TextField label="Địa chỉ" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
            <Button variant="contained" onClick={handleUpdateProfile} disabled={updating} >Lưu thay đổi</Button>
        </Grid>
      </Grid>
    </Paper>
  );
}