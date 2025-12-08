// src/components/wallet/DepositDialog.jsx
import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, TextField, InputAdornment, 
  IconButton, Divider, Stack, Box, CircularProgress,
  useTheme, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaidIcon from '@mui/icons-material/Paid';

import { depositApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

export default function DepositDialog({ open, onClose, onSuccess }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  
  // 1. Theme & Style đồng bộ
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState("PAYPAL"); // Mặc định PayPal
  const [amount, setAmount] = useState("");

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toastWarning("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await depositApi(amount);

      if (res.code === 1000) {
        toastSuccess(`Nạp thành công ${formatPrice(amount)} qua ${method}!`);
        onSuccess(); // Refresh lại ví
        onClose();
        setAmount(""); // Reset form
      } else {
         handleError(res);
      }
    } catch (err) {
      // Xử lý lỗi từ server (nếu có response) hoặc lỗi mạng
      if (err.response && err.response.data) {
          handleError(err.response.data);
      } else {
          toastError("Lỗi kết nối máy chủ!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (data) => {
    if (data.code === 6101) toastError("Số tiền nạp phải lớn hơn 0!");
    else toastError(data.message || "Nạp tiền thất bại!");
  };

  // Style input chuẩn
  const textFieldSx = {
    ...(isDark && {
      "& .MuiOutlinedInput-root": { bgcolor: CUSTOM_DARK_BG },
      "& .MuiSelect-select": { bgcolor: CUSTOM_DARK_BG }
    })
  };

  return (
    <Dialog 
        open={open} 
        onClose={!isLoading ? onClose : undefined} 
        maxWidth="xs" fullWidth
        PaperProps={{ 
            sx: { 
                borderRadius: 3,
                backgroundImage: "none",
                bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper",
            } 
        }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Nạp tiền vào ví</Typography>
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2.5}>
            
            {/* Giả lập chọn phương thức */}
            <FormControl fullWidth>
                <Typography variant="body2" mb={0.5} fontWeight={600}>Phương thức thanh toán</Typography>
                <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    disabled={isLoading}
                    sx={textFieldSx}
                    size="small"
                >
                    <MenuItem value="PAYPAL">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <PaidIcon color="primary" fontSize="small" /> PayPal
                        </Stack>
                    </MenuItem>
                    <MenuItem value="CREDIT_CARD">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <CreditCardIcon color="secondary" fontSize="small" /> Visa / Mastercard
                        </Stack>
                    </MenuItem>
                    <MenuItem value="BANK_TRANSFER">
                        <Stack direction="row" alignItems="center" gap={1}>
                            <AccountBalanceWalletIcon color="success" fontSize="small" /> Chuyển khoản ngân hàng
                        </Stack>
                    </MenuItem>
                </Select>
            </FormControl>

            <Box>
                <Typography variant="body2" mb={0.5} fontWeight={600}>Số tiền muốn nạp</Typography>
                <TextField
                    placeholder="VD: 1000" 
                    type="number" 
                    fullWidth 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading}
                    InputProps={{ endAdornment: <InputAdornment position="end">USD</InputAdornment> }}
                    sx={textFieldSx}
                />
            </Box>

            <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                    * Phí giao dịch: <span style={{ color: '#16c784', fontWeight: 700 }}>Miễn phí</span>
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                    * Thời gian xử lý: Tức thì
                </Typography>
            </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
         <Button onClick={onClose} variant="outlined" color="inherit" fullWidth disabled={isLoading}>Hủy</Button>
         <Button 
            onClick={handleDeposit} 
            variant="contained" color="primary" fullWidth 
            disabled={isLoading} sx={{ color: 'white', fontWeight: 700 }}
         >
            {isLoading ? <CircularProgress size={24} color="inherit"/> : "Xác nhận Nạp"}
         </Button>
      </DialogActions>
    </Dialog>
  );
}