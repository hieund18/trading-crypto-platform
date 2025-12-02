// src/components/admin/UserDetailModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, Box, Chip, Divider, Avatar, 
  Stack, FormControlLabel, Checkbox, IconButton, Tooltip, CircularProgress,
  useTheme
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import { useToast } from "../../utils/toast";
// 🔥 Import API cập nhật quyền
import { updateUserRolesApi } from "../../api/userApi";

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

// 🔥 Thêm props: rolesList (danh sách quyền có sẵn), onSuccess (callback reload user)
export default function UserDetailModal({ open, onClose, user, rolesList = [], onSuccess }) {
  const { toastSuccess, toastError } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]); // 🔥 Lưu mảng ID [1, 2]
  const [saving, setSaving] = useState(false);

  // Load quyền hiện tại của User vào state khi mở modal
  useEffect(() => {
    if (user && user.roles) {
        // Map ra mảng ID: [4, 5]
        setSelectedRoleIds(user.roles.map(r => r.id));
    }
    setIsEditingRoles(false);
  }, [user]);

  if (!user) return null;

  // Xử lý check/uncheck quyền
  const handleToggleRole = (roleId) => {
      setSelectedRoleIds(prev => {
          if (prev.includes(roleId)) {
              return prev.filter(id => id !== roleId);
          } else {
              return [...prev, roleId];
          }
      });
  };

  // 🔥 Gọi API Lưu quyền
  const handleSaveRoles = async () => {
      setSaving(true);
      try {
          const res = await updateUserRolesApi(user.id, selectedRoleIds);
          
          if (res.code === 1000) {
              toastSuccess("Cập nhật quyền thành công!");
              setIsEditingRoles(false);
              if (onSuccess) onSuccess(); // Reload lại danh sách user bên ngoài
              onClose(); // Đóng modal (hoặc giữ lại tùy bạn)
          } 
          else if (res.code === 1003) toastError("Bạn không có quyền thực hiện!");
          else if (res.code === 1310) toastError("Người dùng không tồn tại!");
          else toastError(res.message || "Cập nhật thất bại");

      } catch (err) {
          const backendErr = err.response?.data;
          if (backendErr?.code === 1003) toastError("Bạn không có quyền thực hiện!");
          else toastError("Lỗi kết nối máy chủ");
      } finally {
          setSaving(false);
      }
  };

  return (
    <Dialog 
        open={open} 
        onClose={!saving ? onClose : undefined} 
        maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none", bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper" } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24, fontWeight: 700 }}>
                {user.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700}>{user.username}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>ID: {user.id}</Typography>
            </Box>
        </Box>
        <IconButton onClick={onClose} disabled={saving}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
            {/* CỘT TRÁI & PHẢI: GIỮ NGUYÊN */}
            <Grid size={{ xs: 12, md: 6 }}>
                <SectionTitle title="Thông tin chung" />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Trạng thái" customValue={<Chip label={user.isActive ? "Hoạt động" : "Đang khóa"} color={user.isActive ? "success" : "error"} size="small" sx={{ fontWeight: 600 }} />} />
                <InfoRow label="Ngày tạo" value={formatDate(user.createdAt)} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <SectionTitle title="Bảo mật & Liên kết" />
                <InfoRow label="Xác thực Email" customValue={<StatusBadge active={user.emailVerified} activeText="Đã xác thực" inactiveText="Chưa xác thực" />} />
                <InfoRow label="Bảo mật 2 lớp (2FA)" customValue={<StatusBadge active={user.twoFactorEnabled} activeText="Đang bật" inactiveText="Đang tắt" />} />
                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Tài khoản xã hội</Typography>
                    <Stack direction="row" spacing={1}>
                        <SocialChip icon={<GoogleIcon />} label="Google" connected={!!user.googleAccountId} />
                        <SocialChip icon={<GitHubIcon />} label="GitHub" connected={!!user.githubAccountId} color="default" />
                    </Stack>
                </Box>
            </Grid>
            
            <Grid size={{ xs: 12 }}><Divider /></Grid>

            {/* 🔥 PHẦN PHÂN QUYỀN (ĐÃ UPDATE) */}
            <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <SectionTitle title="Phân quyền & Vai trò" noMb />
                    {!isEditingRoles ? (
                        <Button startIcon={<EditIcon />} variant="outlined" size="small" onClick={() => setIsEditingRoles(true)}>Chỉnh sửa</Button>
                    ) : (
                        <Stack direction="row" spacing={1}>
                            <Button color="inherit" size="small" onClick={() => setIsEditingRoles(false)} disabled={saving}>Hủy</Button>
                            <Button startIcon={<SaveIcon />} variant="contained" size="small" onClick={handleSaveRoles} disabled={saving}>
                                {saving ? "Đang lưu..." : "Lưu lại"}
                            </Button>
                        </Stack>
                    )}
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    {!isEditingRoles ? (
                        // CHẾ ĐỘ XEM: Hiển thị các quyền hiện có của user
                        user.roles && user.roles.length > 0 ? (
                            user.roles.map(role => (
                                <Chip key={role.id} label={role.name} color={role.name === 'ADMIN' ? "error" : "primary"} sx={{ mr: 1, fontWeight: 700 }} />
                            ))
                        ) : (<Typography variant="body2" color="text.secondary">Người dùng chưa có vai trò nào.</Typography>)
                    ) : (
                        // 🔥 CHẾ ĐỘ SỬA: Hiển thị tất cả roles từ API (rolesList)
                        <Stack direction="row" gap={2} flexWrap="wrap">
                            {rolesList.length > 0 ? rolesList.map((role) => (
                                <FormControlLabel
                                    key={role.id}
                                    control={
                                        <Checkbox 
                                            // Kiểm tra xem ID của role này có trong mảng selectedRoleIds không
                                            checked={selectedRoleIds.includes(role.id)}
                                            onChange={() => handleToggleRole(role.id)}
                                            color={role.name === 'ADMIN' ? "error" : "primary"}
                                        />
                                    }
                                    label={<Typography fontWeight={500}>{role.name}</Typography>}
                                />
                            )) : (
                                <Typography variant="caption" color="error">Không tải được danh sách quyền.</Typography>
                            )}
                        </Stack>
                    )}
                </Box>
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

// Components con giữ nguyên
function SectionTitle({ title, noMb }) { return <Typography variant="subtitle1" fontWeight={700} color="primary.main" mb={noMb ? 0 : 2} sx={{ textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.5 }}>{title}</Typography>; }
function InfoRow({ label, value, customValue }) { return <Box mb={1.5} display="flex" flexDirection="column"><Typography variant="caption" color="text.secondary">{label}</Typography>{customValue ? customValue : (<Typography variant="body1" fontWeight={500} sx={{ wordBreak: 'break-all' }}>{value || "---"}</Typography>)}</Box>; }
function StatusBadge({ active, activeText, inactiveText }) { return <Stack direction="row" alignItems="center" gap={0.8}>{active ? <CheckCircleIcon color="success" fontSize="small"/> : <CancelIcon color="disabled" fontSize="small"/>}<Typography variant="body2" fontWeight={500} color={active ? "text.primary" : "text.secondary"}>{active ? activeText : inactiveText}</Typography></Stack>; }
function SocialChip({ icon, label, connected, color = "primary" }) { return <Tooltip title={connected ? `Đã liên kết ${label}` : `Chưa liên kết ${label}`}><Chip icon={icon} label={connected ? "Đã kết nối" : "Chưa kết nối"} color={connected ? color : "default"} variant={connected ? "filled" : "outlined"} size="small" sx={{ opacity: connected ? 1 : 0.7, '& .MuiChip-label': { px: 1 } }} /></Tooltip>; }