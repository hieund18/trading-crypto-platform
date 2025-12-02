// src/pages/settings/SecurityTab.jsx
import React, { useState } from "react";
import { Paper, Typography, Box, Button, Divider, Switch, Collapse, Stack, TextField, InputAdornment, IconButton } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useToast } from "../../utils/toast";
import { changePasswordApi, update2FaStatusApi } from "../../api/authApi";
import { clearAuth } from "../../api/tokenUtils";
import { useNavigate } from "react-router-dom";
import SetPasswordDialog from "../../components/auth/SetPasswordDialog";

export default function SecurityTab({ identity, onRefresh }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  const nav = useNavigate();

  const [expandPassword, setExpandPassword] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openSetPassDialog, setOpenSetPassDialog] = useState(false);

  const handleToggle2FA = async (e) => {
    const newStatus = e.target.checked; 
    try {
        const res = await update2FaStatusApi(newStatus);
        if (res.code === 1000) {
            onRefresh(); // Refresh identity data
            toastSuccess(newStatus ? "Đã BẬT bảo mật 2 lớp" : "Đã TẮT bảo mật 2 lớp");
        } else toastError(res.message);
    } catch (err) { toastError("Lỗi kết nối"); }
  };

  const handleChangePassword = async () => {
    if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
        toastWarning("Vui lòng điền đủ thông tin"); return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
        toastWarning("Mật khẩu mới không khớp"); return;
    }
    setUpdating(true);
    try {
        const res = await changePasswordApi(passData);
        if (res.code === 1000) {
            toastSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
            clearAuth();
            setTimeout(() => { nav("/login"); }, 1500);
        } else toastError(res.message);
    } catch (err) { toastError(err.response?.data?.message || "Lỗi kết nối"); } 
    finally { setUpdating(false); }
  };

  const handleCloseSetPass = (isSuccess) => {
      setOpenSetPassDialog(false);
      if(isSuccess) onRefresh();
  };

  const commonPaperSx = { borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', overflow: 'hidden', p: 3 };
  const actionBtnSx = { color: "text.primary", bgcolor: "action.hover", boxShadow: "none", textTransform: "none", fontWeight: 600, borderRadius: 1, px: 2, py: 0.6, minWidth: 'auto', "&:hover": { bgcolor: "action.selected", boxShadow: "none" } };

  return (
    <>
      <Paper elevation={0} sx={commonPaperSx}>
        <Typography variant="h6" fontWeight={700} mb={3}>Bảo mật tài khoản</Typography>
        
        <SecurityRow 
            icon={<EmailIcon fontSize="large" />} title="Xác thực qua Email (2FA)"
            desc="Nhận mã OTP qua email khi đăng nhập trên thiết bị lạ."
            action={<Switch checked={identity?.twoFactorEnabled || false} onChange={handleToggle2FA} />}
        />

        <Divider sx={{ my: 2 }} />

        {identity?.noPassword ? (
             <SecurityRow 
                icon={<LockOutlinedIcon fontSize="large" />} title="Thiết lập mật khẩu"
                desc="Bạn chưa có mật khẩu. Hãy thiết lập để bảo vệ tài khoản tốt hơn."
                action={<Button variant="contained" color="primary" onClick={() => setOpenSetPassDialog(true)} sx={actionBtnSx}>Thiết lập ngay</Button>}
            />
        ) : (
            <>
                <SecurityRow 
                    icon={<LockOutlinedIcon fontSize="large" />} title="Mật khẩu đăng nhập"
                    desc="Được sử dụng để đăng nhập vào tài khoản của bạn."
                    action={<Button variant="contained" onClick={() => setExpandPassword(!expandPassword)} sx={actionBtnSx}>{expandPassword ? "Hủy" : "Thay đổi"}</Button>}
                />
                <Collapse in={expandPassword}>
                    <Box sx={{ mt: 2, p: 3, borderRadius: 2, bgcolor: 'transparent', border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={2}>
                            <PasswordField label="Mật khẩu hiện tại" value={passData.oldPassword} onChange={(e) => setPassData({...passData, oldPassword: e.target.value})} showPass={showPass} setShowPass={setShowPass} />
                            <PasswordField label="Mật khẩu mới" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} showPass={showPass} setShowPass={setShowPass} />
                            <PasswordField label="Xác nhận mật khẩu mới" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} showPass={showPass} setShowPass={setShowPass} />
                            <Box display="flex" justifyContent="flex-end"><Button variant="contained" onClick={handleChangePassword} disabled={updating}>Xác nhận đổi</Button></Box>
                        </Stack>
                    </Box>
                </Collapse>
            </>
        )}
      </Paper>
      <SetPasswordDialog open={openSetPassDialog} onClose={handleCloseSetPass} />
    </>
  );
}

function SecurityRow({ icon, title, desc, action }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
            <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'action.selected' }}>{icon}</Box>
                <Box><Typography fontWeight={600}>{title}</Typography><Typography variant="body2" color="text.secondary">{desc}</Typography></Box>
            </Box>
            <Box>{action}</Box>
        </Box>
    )
}
function PasswordField({ label, value, onChange, showPass, setShowPass }) {
    return <TextField label={label} type={showPass ? "text" : "password"} value={value} onChange={onChange} fullWidth size="small" InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>) }} />
}