// src/components/wallet/TransferDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, TextField, InputAdornment, 
  IconButton, Divider, Stack, Box, CircularProgress,
  useTheme // 1. Import useTheme
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import OtpInput from "../auth/OtpInput";
import { transferApi, sendTransferOtpApi, verifyTransferOtpApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

export default function TransferDialog({ open, onClose, onSuccess, balance }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  
  // 2. Lấy theme để check mode
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Mã màu bạn yêu cầu
  const CUSTOM_DARK_BG = "#1C2024";

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [transferId, setTransferId] = useState(null);
  const [formData, setFormData] = useState({
    toWalletId: "",
    amount: ""
  });
  
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({ toWalletId: "", amount: "" });
      setOtp("");
      setTransferId(null);
      setCountdown(0);
      setIsLoading(false);
    }
  }, [open]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCreateTransfer = async () => {
    const { toWalletId, amount } = formData;
    
    if (!toWalletId.trim() || !amount) {
      toastWarning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (parseFloat(amount) <= 0) {
      toastWarning("Số tiền phải lớn hơn 0");
      return;
    }

    setIsLoading(true);
    try {
      const res = await transferApi({
        toWalletId: toWalletId.trim(),
        amount: parseFloat(amount)
      });

      if (res.code === 1000) {
        const result = res.result;
        setTransferId(result.id);
        await handleSendOtp(result.id);
        
        toastSuccess("Vui lòng nhập OTP để xác nhận!");
        setStep(2);
      } else {
         handleError(res);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (id) => {
    const targetId = id || transferId; 
    try {
      const res = await sendTransferOtpApi(targetId);
      if (res.code === 1000) {
        setCountdown(60);
        if (!id) toastSuccess("Đã gửi lại mã OTP!");
      } else {
        toastError(res.message || "Không thể gửi OTP");
      }
    } catch (err) {
      console.error(err);
      toastError("Lỗi khi gửi OTP. Vui lòng thử lại.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toastWarning("Vui lòng nhập đủ 6 số OTP");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await verifyTransferOtpApi(transferId, otp);
      if (res.code === 1000) {
        toastSuccess("Chuyển tiền thành công!");
        onSuccess();
        onClose();
      } else {
        handleError(res);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err) => {
    const data = err.response ? err.response.data : err;
    const { code, message } = data;

    if (code === 6102) toastError("Ví người nhận không tồn tại!");
    else if (code === 6105) toastError("Số dư không đủ để thực hiện giao dịch!");
    else if (code === 6108) toastError("Yêu cầu chuyển tiền không tồn tại hoặc đã hết hạn!");
    else toastError(message || "Có lỗi xảy ra!");
  };

  const isStep1 = step === 1;

  // 3. Style override cho Input
  // Nếu là dark mode thì ép màu nền thành CUSTOM_DARK_BG, ngược lại để mặc định (theo theme)
  const textFieldSx = {
    ...(isDark && {
      "& .MuiOutlinedInput-root": {
        bgcolor: CUSTOM_DARK_BG, 
      }
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
                // 4. Áp dụng màu nền Dialog
                bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper",
            } 
        }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          {isStep1 ? "Chuyển tiền" : "Xác thực OTP"}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isLoading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {isStep1 ? (
          <Stack spacing={2.5}>
            <TextField
              label="Ví người nhận" 
              placeholder="Nhập ID ví người nhận" 
              fullWidth 
              value={formData.toWalletId}
              onChange={(e) => setFormData({...formData, toWalletId: e.target.value})}
              disabled={isLoading}
              // 5. Áp dụng style input
              sx={textFieldSx}
            />
            
            <TextField
              label="Số tiền chuyển" 
              placeholder="VD: 100" 
              type="number" 
              fullWidth 
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              disabled={isLoading}
              InputProps={{ endAdornment: <InputAdornment position="end">USD</InputAdornment> }}
              // 5. Áp dụng style input
              sx={textFieldSx}
            />

            <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Số dư khả dụng:</Typography>
                    <Typography variant="body2" fontWeight={700} color="text.primary">{formatPrice(balance)}</Typography>
                </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nhập mã OTP gửi đến email để xác nhận chuyển <b>{formatPrice(formData.amount)}</b>.
            </Typography>
            
            <OtpInput value={otp} onChange={setOtp} />
            
            <Button 
                onClick={() => handleSendOtp()} 
                disabled={countdown > 0}
                sx={{ textTransform: 'none', fontWeight: 600 }}
            >
               {countdown > 0 ? `Gửi lại sau (${countdown}s)` : "Gửi lại mã OTP"}
            </Button>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {isStep1 ? (
           <>
             <Button onClick={onClose} variant="outlined" color="inherit" fullWidth disabled={isLoading}>Hủy</Button>
             <Button 
                onClick={handleCreateTransfer} 
                variant="contained" color="primary" fullWidth 
                disabled={isLoading} sx={{ color: 'white' }}
             >
                {isLoading ? <CircularProgress size={24} color="inherit"/> : "Tiếp tục"}
             </Button>
           </>
        ) : (
           <>
             <Button onClick={() => setStep(1)} variant="outlined" color="inherit" fullWidth disabled={isLoading}>Quay lại</Button>
             <Button 
                onClick={handleVerifyOtp} 
                variant="contained" color="primary" fullWidth 
                disabled={isLoading}
             >
                {isLoading ? <CircularProgress size={24} color="inherit"/> : "Xác nhận"}
             </Button>
           </>
        )}
      </DialogActions>
    </Dialog>
  );
}