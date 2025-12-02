// src/components/wallet/WithdrawDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, TextField, InputAdornment, 
  IconButton, Divider, Stack, Box, CircularProgress,
  useTheme // 1. Import useTheme
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

import OtpInput from "../auth/OtpInput";
import { withdrawApi, sendWithdrawOtpApi, verifyWithdrawOtpApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

export default function WithdrawDialog({ open, onClose, onSuccess, balance }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  
  // 2. Lấy theme để check mode
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // 🔥 MÀU MỚI BẠN CHỌN
  const CUSTOM_DARK_BG = "#1C2024";

  // State quản lý Step: 1 (Info) | 2 (OTP)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data rút tiền
  const [withdrawId, setWithdrawId] = useState(null);
  const [formData, setFormData] = useState({
    bankName: "",
    bankAccount: "",
    amount: ""
  });
  
  // Data OTP
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({ bankName: "", bankAccount: "", amount: "" });
      setOtp("");
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

  const handleCreateWithdraw = async () => {
    const { bankName, bankAccount, amount } = formData;
    if (!bankName || !bankAccount || !amount) {
      toastWarning("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (parseFloat(amount) <= 1) {
      toastWarning("Số tiền phải lớn hơn 1");
      return;
    }

    setIsLoading(true);
    try {
      const res = await withdrawApi({
        bankName,
        bankAccount,
        amount: parseFloat(amount)
      });

      if (res.code === 1000) {
        const result = res.result;
        setWithdrawId(result.id); 
        await handleSendOtp(result.id);
        
        toastSuccess("Vui lòng nhập mã OTP để xác nhận!");
        setStep(2); 
      } else {
         toastError(res.message || "Không thể tạo lệnh rút!");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (id) => {
    const targetId = id || withdrawId; 
    try {
      const res = await sendWithdrawOtpApi(targetId);
      if (res.code === 1000) {
        setCountdown(60); 
        if (!id) toastSuccess("Đã gửi lại mã OTP!");
      }
    } catch (err) {
      console.error(err);
      toastError("Không thể gửi OTP. Vui lòng thử lại.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toastWarning("Vui lòng nhập đủ 6 số OTP");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await verifyWithdrawOtpApi(withdrawId, otp);
      if (res.code === 1000) {
        toastSuccess("Gửi yêu cầu rút tiền thành công! Đang chờ xử lý.");
        onSuccess(); 
        onClose();   
      } else {
        toastError(res.message || "OTP không chính xác!");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err) => {
    if (err.response) {
      const { code, message } = err.response.data;
      if (code === 6105) toastError("Số dư không đủ!");
      else if (code === 6101) toastError("Số tiền quá nhỏ!");
      else toastError(message || "Có lỗi xảy ra!");
    } else {
      toastError("Lỗi kết nối máy chủ!");
    }
  };

  const isStep1 = step === 1;

  // 3. Style override cho Input (Dùng chung)
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
          {isStep1 ? "Rút tiền về Ngân hàng" : "Xác thực OTP"}
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
              label="Tên ngân hàng" placeholder="VD: Vietcombank" fullWidth
              value={formData.bankName}
              onChange={(e) => setFormData({...formData, bankName: e.target.value})}
              disabled={isLoading}
              // 5. Áp dụng style input
              sx={textFieldSx}
            />
            <TextField
              label="Số tài khoản" placeholder="Nhập số tài khoản" fullWidth
              value={formData.bankAccount}
              onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
              disabled={isLoading}
              // 5. Áp dụng style input
              sx={textFieldSx}
            />
            <TextField
              label="Số tiền" placeholder="VD: 100" type="number" fullWidth
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
              Mã xác thực đã được gửi đến email của bạn.
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
                onClick={handleCreateWithdraw} 
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