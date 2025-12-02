// src/components/admin/ConfirmLockDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Divider, Box, 
  useTheme, CircularProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ConfirmLockDialog({ open, onClose, onConfirm, user, loading }) {
  // 1. Cấu hình Theme giống các Dialog khác
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  if (!user) return null;

  // 2. Logic hiển thị tên: Ưu tiên Email -> Username -> ID
  const displayName = user.email || user.username || user.id;

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="xs" 
      fullWidth
      PaperProps={{ 
        sx: { 
            borderRadius: 3, 
            backgroundImage: "none", 
            bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper",
            boxShadow: theme.shadows[24]
        } 
      }}
    >
      {/* HEADER: Tiêu đề + Nút X */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
            <WarningAmberRoundedIcon 
                color={user.isActive ? "error" : "success"} 
                sx={{ fontSize: 28 }} 
            />
            <Typography variant="h6" fontWeight={700}>
                {user.isActive ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Typography color="text.secondary" fontSize="0.95rem">
            Bạn có chắc chắn muốn {user.isActive ? <b>KHÓA</b> : <b>MỞ KHÓA</b>} tài khoản này không?
        </Typography>
        
        {/* Hiển thị thông tin User nổi bật */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
             <Typography variant="subtitle2" color="text.secondary">Tài khoản:</Typography>
             <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ wordBreak: 'break-all' }}>
                {displayName}
             </Typography>
             {/* Nếu hiển thị Email ở trên rồi thì có thể hiện thêm ID ở dưới cho chắc chắn */}
             <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', mt: 0.5, display: 'block' }}>
                ID: {user.id}
             </Typography>
        </Box>

        {user.isActive && (
            <Typography variant="caption" color="error" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                * Người dùng này sẽ mất quyền truy cập ngay lập tức.
            </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
            onClick={onClose} 
            variant="outlined" 
            color="inherit" 
            disabled={loading}
            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
            Hủy bỏ
        </Button>
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            // Khóa thì màu đỏ (error), Mở thì màu xanh (success)
            color={user.isActive ? "error" : "success"} 
            disabled={loading}
            sx={{ 
                borderRadius: 1.5, 
                textTransform: 'none', 
                fontWeight: 600, 
                color: 'white',
                minWidth: 100
            }}
        >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}