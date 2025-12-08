// src/components/admin/ConfirmWithdrawalDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Divider, Box, 
  useTheme, CircularProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { formatPrice } from "../../utils/formatters";

// Hàm format ngày (có thể import hoặc khai báo lại)
const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function ConfirmWithdrawalDialog({ open, onClose, onConfirm, type, item, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  if (!item) return null;

  const isApprove = type === "APPROVE";

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      // 🔥 1. CHỈNH RỘNG RA: Đổi xs -> sm
      maxWidth="sm" 
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
                color="warning" 
                sx={{ fontSize: 28 }} 
            />
            <Typography variant="h6" fontWeight={700}>
                Xác nhận xử lý
            </Typography>
        </Box>
        {/* 🔥 2. THÊM NÚT ĐÓNG (X) */}
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Typography color="text.secondary" mb={2}>
            Bạn có chắc chắn muốn <b>{isApprove ? "DUYỆT (APPROVE)" : "TỪ CHỐI (REJECT)"}</b> yêu cầu rút tiền này không?
        </Typography>
        
        {/* Thông tin chi tiết */}
        <Box sx={{ bgcolor: 'action.hover', p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <DetailRow label="Mã yêu cầu" value={item.id} isMono />
            <DetailRow label="User ID" value={item.userId} isMono />
            
            <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
            
            <DetailRow label="Ngân hàng" value={item.bankName} />
            <DetailRow label="Số tài khoản" value={item.bankAccount} isMono />
            <DetailRow 
                label="Số tiền rút" 
                value={`-${formatPrice(item.amount)}`} 
                color="error.main" 
                isBold 
            />
            <DetailRow label="Thời gian tạo" value={formatDate(item.createdAt)} />
        </Box>

        {!isApprove && (
            <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
                * Hành động từ chối sẽ hoàn lại tiền vào ví người dùng.
            </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
            onClick={onClose} 
            variant="outlined" 
            color="inherit" 
            disabled={loading}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
        >
            Hủy bỏ
        </Button>
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            color={isApprove ? "success" : "error"} 
            disabled={loading}
            sx={{ 
                borderRadius: 1.5, 
                fontWeight: 600, 
                color: 'white',
                minWidth: 100
            }}
        >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isApprove ? "Duyệt đơn" : "Từ chối")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper component
function DetailRow({ label, value, isMono, isBold, color = "text.primary" }) {
    return (
        <Box display="flex" justifyContent="space-between" mb={1} sx={{ wordBreak: 'break-all' }}>
            <Typography variant="body2" color="text.secondary">{label}:</Typography>
            <Typography 
                variant="body2" 
                color={color} 
                fontWeight={isBold ? 700 : 500}
                sx={{ 
                    fontFamily: isMono ? 'monospace' : 'inherit', 
                    textAlign: 'right', 
                    pl: 4, // Padding trái để tách biệt label và value
                    fontSize: isMono ? '0.85rem' : '0.875rem'
                }}
            >
                {value}
            </Typography>
        </Box>
    )
}