// src/components/admin/ConfirmCoinStatusDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Divider, Box, 
  useTheme, CircularProgress, Avatar
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ConfirmCoinStatusDialog({ open, onClose, onConfirm, coin, loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  if (!coin) return null;

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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
            <WarningAmberRoundedIcon 
                color={coin.isActive ? "error" : "success"} 
                sx={{ fontSize: 28 }} 
            />
            <Typography variant="h6" fontWeight={700}>
                {coin.isActive ? "Vô hiệu hóa Coin?" : "Kích hoạt Coin?"}
            </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Typography color="text.secondary" fontSize="0.95rem">
            Bạn có chắc chắn muốn {coin.isActive ? <b>VÔ HIỆU HÓA</b> : <b>KÍCH HOẠT</b>} đồng coin này không?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
             <Avatar src={coin.image} sx={{ width: 40, height: 40 }} />
             <Box>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                    {coin.name} ({coin.symbol?.toUpperCase()})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    ID: {coin.id}
                </Typography>
             </Box>
        </Box>

        {coin.isActive && (
            <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
                * Coin này sẽ bị ẩn khỏi danh sách thị trường và người dùng không thể giao dịch.
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
            color={coin.isActive ? "error" : "success"} 
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