// src/components/coin/TradeForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  alpha // 1. Thêm alpha để xử lý màu hover tự động
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from "react-router-dom";

// IMPORT API
import { 
  convertQuantityToAmountApi, 
  convertAmountToQuantityApi 
} from "../../api/coinApi";
import { getMyWalletApi } from "../../api/walletApi";
import { 
  getAssetAvailabilityApi, 
  buyCoinApi, 
  sellCoinApi 
} from "../../api/orderApi";

import { formatPrice } from "../../utils/formatters";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../utils/toast";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function TradeForm({ coinId, symbol, currentPrice }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const { toastSuccess, toastError, toastWarning } = useToast();
  
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  const [tradeTab, setTradeTab] = useState(0); 
  const isBuy = tradeTab === 0;
  const symbolUpper = symbol?.toUpperCase();

  // State Input
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  
  // State Balance
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [coinBalance, setCoinBalance] = useState(0);
  
  const [displayPrice, setDisplayPrice] = useState(currentPrice);
  const [loading, setLoading] = useState(false); 
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState("");
  const [lastChanged, setLastChanged] = useState(null); 

  const [openConfirm, setOpenConfirm] = useState(false);

  const debouncedQuantity = useDebounce(quantity, 500);
  const debouncedAmount = useDebounce(amount, 500);

  // 2. 🔥 SỬA: Lấy màu từ Theme thay vì Hardcode
  // Fallback an toàn nếu theme chưa load kịp
  const upColor = theme.palette.trade?.up || "#16c784";
  const downColor = theme.palette.trade?.down || "#ea3943";

  const activeColor = isBuy ? upColor : downColor;
  // Tạo màu hover tự động tối hơn/sáng hơn chút
  const hoverColor = alpha(activeColor, 0.8);

  // --- 1. FETCH BALANCES ---
  const fetchBalances = async () => {
    if (!user) {
      setUsdtBalance(0);
      setCoinBalance(0);
      return;
    }
    try {
      const [walletRes, assetRes] = await Promise.all([
          getMyWalletApi(), 
          getAssetAvailabilityApi(coinId)
      ]);
      if (walletRes.code === 1000) setUsdtBalance(walletRes.result.balance);
      if (assetRes.code === 1000) setCoinBalance(assetRes.result.quantity);
    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [user, coinId]);

  useEffect(() => {
    if (!loading && !quantity && !amount) {
      setDisplayPrice(currentPrice);
    }
  }, [currentPrice, loading, quantity, amount]);

  // --- 2. CONVERT LOGIC ---
  useEffect(() => {
    if (lastChanged === 'quantity' && debouncedQuantity) handleConvertQuantity(debouncedQuantity);
  }, [debouncedQuantity]);

  const handleConvertQuantity = async (val) => {
    if (!coinId || parseFloat(val) <= 0) return;
    setLoading(true); setError("");
    try {
      const res = await convertQuantityToAmountApi(coinId, val);
      if (res.code === 1000) {
        setAmount(res.result.amount);
        setDisplayPrice(res.result.price);
      }
    } catch (err) { setError("Lỗi kết nối"); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (lastChanged === 'amount' && debouncedAmount) handleConvertAmount(debouncedAmount);
  }, [debouncedAmount]);

  const handleConvertAmount = async (val) => {
    if (!coinId || parseFloat(val) <= 0) return;
    setLoading(true); setError("");
    try {
      const res = await convertAmountToQuantityApi(coinId, val);
      if (res.code === 1000) {
        setQuantity(res.result.quantity);
        setDisplayPrice(res.result.price);
      }
    } catch (err) { setError("Lỗi kết nối"); } finally { setLoading(false); }
  };

  // --- 3. INPUT CHANGE ---
  const onQuantityChange = (e) => {
    const val = e.target.value;
    if (!/^\d*\.?\d*$/.test(val)) return;
    setQuantity(val);
    setLastChanged('quantity');
    if (!val) setAmount("");
  };

  const onAmountChange = (e) => {
    const val = e.target.value;
    if (!/^\d*\.?\d*$/.test(val)) return;
    setAmount(val);
    setLastChanged('amount');
    if (!val) setQuantity("");
  };

  // --- 4. PERCENT CLICK ---
  const handlePercentClick = (percentStr) => {
    if (!user) {
       toastWarning("Vui lòng đăng nhập!");
       return;
    }
    const percent = parseInt(percentStr) / 100;

    if (isBuy) {
      const calcAmount = usdtBalance * percent;
      setAmount(calcAmount.toString());
      setLastChanged('amount');
      handleConvertAmount(calcAmount);
    } else {
      const calcQuantity = coinBalance * percent;
      setQuantity(calcQuantity.toString());
      setLastChanged('quantity');
      handleConvertQuantity(calcQuantity);
    }
  };

  // --- 5. PRE-CHECK ---
  const handlePreCheck = () => {
    if (!user) {
      toastWarning("Vui lòng đăng nhập để giao dịch!");
      nav("/login", { state: { from: location } });
      return;
    }
    if (isBuy) {
        if (!amount || parseFloat(amount) <= 0) {
            toastWarning("Vui lòng nhập tổng tiền hợp lệ!");
            return;
        }
    } else {
        if (!quantity || parseFloat(quantity) <= 0) {
            toastWarning("Vui lòng nhập số lượng coin hợp lệ!");
            return;
        }
    }
    setOpenConfirm(true);
  };

  // --- 6. EXECUTE TRADE ---
  const handleConfirmTrade = async () => {
    setOpenConfirm(false);
    setSubmitting(true);
    
    try {
      let res;
      if (isBuy) {
        res = await buyCoinApi(coinId, amount);
      } else {
        res = await sellCoinApi(coinId, quantity);
      }

      if (res.code === 1000) {
        toastSuccess(`Đặt lệnh ${isBuy ? "MUA" : "BÁN"} thành công!`);
        setQuantity("");
        setAmount("");
        fetchBalances();
      } else {
        handleTradeError(res);
      }
    } catch (err) {
      console.error(err);
      if(err.response?.data) {
        handleTradeError(err.response.data);
      } else {
        toastError("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTradeError = (data) => {
    switch (data.code) {
      case 5103: toastError("Coin không tồn tại hoặc tạm ngưng giao dịch!"); break;
      case 6105: toastError("Số dư USDT không đủ!"); break;
      case 7101: toastError("Số dư Coin không đủ!"); break;
      default: toastError(data.message || "Đặt lệnh thất bại!");
    }
  };

  const formatBalance = (val, decimals = 2) => {
     return val ? val.toLocaleString("en-US", { maximumFractionDigits: decimals }) : "0";
  };

  // Style input Dark Mode
  const textFieldSx = {
    ...(isDark && {
      "& .MuiOutlinedInput-root": {
        bgcolor: CUSTOM_DARK_BG, 
      }
    })
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: 'fit-content',
        bgcolor: 'background.default',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Tabs
        value={tradeTab}
        onChange={(e, v) => { setTradeTab(v); setQuantity(""); setAmount(""); setError(""); }}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 48,
          '& .MuiIndicator': { bgcolor: activeColor, height: 3 },
          '& .MuiTab-root': { 
            minHeight: 48, 
            fontSize: 16, 
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.secondary',
            '&.Mui-selected': { color: 'text.primary' }
          }
        }}
      >
        <Tab label="Mua" />
        <Tab label="Bán" />
      </Tabs>

      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* INFO */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
               Lệnh Thị trường
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {isBuy 
                  ? `${formatBalance(usdtBalance, 2)} USDT`
                  : `${formatBalance(coinBalance, 6)} ${symbolUpper}`
                }
              </Typography>
            </Stack>
        </Stack>

        {/* INPUT QUANTITY */}
        <Box>
            <Typography variant="body2" color="text.secondary" mb={0.8} fontWeight={500}>
                Số lượng ({symbolUpper})
            </Typography>
            <TextField
                fullWidth size="small"
                value={quantity} onChange={onQuantityChange} placeholder="0.00"
                InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography variant="body2" fontWeight={700}>{symbolUpper}</Typography></InputAdornment>
                }}
                sx={{
                    ...textFieldSx, // Áp dụng nền tối
                    "& .MuiOutlinedInput-root": { 
                        ...textFieldSx["& .MuiOutlinedInput-root"],
                        borderRadius: 1.5,
                        "& fieldset": { borderColor: 'divider' },
                        "&.Mui-focused fieldset": { borderColor: activeColor, borderWidth: 1 } 
                    },
                    "& input": { fontWeight: 600 }
                }}
            />
        </Box>

        {/* RATE */}
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ color: "text.secondary" }}>
            <SwapVertIcon fontSize="small" /> 
            <Typography variant="body2" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                1 {symbolUpper} ≈ 
                <Typography component="span" fontWeight={600} color="text.primary">
                    {loading ? <CircularProgress size={14} color="inherit" /> : formatPrice(displayPrice)}
                </Typography>
            </Typography>
        </Stack>

        {/* INPUT AMOUNT */}
        <Box>
            <Typography variant="body2" color="text.secondary" mb={0.8} fontWeight={500}>
                Tổng cộng (USDT)
            </Typography>
            <TextField
                fullWidth size="small"
                value={amount} onChange={onAmountChange} placeholder="0.00"
                InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography variant="body2" fontWeight={700}>USDT</Typography></InputAdornment>
                }}
                sx={{
                    ...textFieldSx, // Áp dụng nền tối
                    "& .MuiOutlinedInput-root": { 
                        ...textFieldSx["& .MuiOutlinedInput-root"],
                        borderRadius: 1.5,
                        "& fieldset": { borderColor: 'divider' },
                        "&.Mui-focused fieldset": { borderColor: activeColor, borderWidth: 1 } 
                    },
                    "& input": { fontWeight: 600 }
                }}
            />
        </Box>

        {/* SHORTCUTS */}
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          {['25%', '50%', '75%', '100%'].map(pc => (
            <Box
              key={pc} onClick={() => handlePercentClick(pc)}
              sx={{
                flex: 1, bgcolor: 'action.hover', color: 'text.secondary', py: 0.8, 
                borderRadius: 1, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                border: '1px solid transparent', transition: 'all 0.2s',
                '&:hover': { borderColor: 'divider', color: 'text.primary', bgcolor: 'action.selected' }
              }}
            >
              {pc}
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 0.5 }} />

        {/* BUTTON ĐẶT LỆNH (Vẫn giữ màu xanh/đỏ trade) */}
        <Button
          fullWidth variant="contained" size="medium" 
          disabled={loading || submitting}
          onClick={handlePreCheck}
          sx={{
            bgcolor: activeColor, color: '#fff', fontWeight: 700, fontSize: 16, py: 1.5, borderRadius: 1.5, boxShadow: 'none',
            '&:hover': { bgcolor: hoverColor, boxShadow: 'none' },
            '&.Mui-disabled': { opacity: 0.7, color: '#fff' }
          }}
        >
          {submitting ? "Đang xử lý..." : loading ? "Đang tính..." : (isBuy ? `Mua ${symbolUpper}` : `Bán ${symbolUpper}`)}
        </Button>
      </Box>

      {/* --- DIALOG CONFIRM --- */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: { 
            borderRadius: 3, 
            minWidth: 360, 
            maxWidth: 400,
            backgroundImage: "none",
            bgcolor: isDark ? CUSTOM_DARK_BG : 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Xác nhận {isBuy ? "Mua" : "Bán"}
          </Typography>
          <IconButton onClick={() => setOpenConfirm(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography color="text.secondary" variant="body2" mb={0.5}>
                  Bạn sẽ {isBuy ? "chi" : "nhận"} khoảng
                </Typography>
                <Typography variant="h4" fontWeight={700} color={activeColor}>
                  {formatPrice(amount)}
                </Typography>
             </Box>

             <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
                <DetailRow label="Cặp giao dịch" value={`${symbolUpper}/USDT`} />
                <DetailRow label="Loại lệnh" value="Thị trường (Market)" />
                <DetailRow 
                   label={isBuy ? "Mua vào" : "Bán ra"} 
                   value={`${quantity} ${symbolUpper}`} 
                   valueColor="text.primary"
                />
             </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button 
            onClick={() => setOpenConfirm(false)} 
            variant="outlined"
            fullWidth
            sx={{ 
                borderColor: 'divider', color: 'text.primary', fontWeight: 600, py: 1.2,
                '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' }
            }}
          >
            Hủy
          </Button>
          
          {/* 🔥 3. SỬA: NÚT XÁC NHẬN CHUYỂN VỀ PRIMARY (BLUE) */}
          <Button 
            onClick={handleConfirmTrade} 
            variant="contained" 
            fullWidth
            autoFocus
            // Dùng màu mặc định của primary
            color="primary" 
            sx={{ 
                fontWeight: 700, 
                py: 1.2, 
                boxShadow: 'none',
                // Nền mặc định primary.main, hover tự động làm tối bởi MUI hoặc dùng primary.dark
                '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
}

function DetailRow({ label, value, valueColor = "text.primary" }) {
    return (
        <Stack direction="row" justifyContent="space-between" mb={1} lastChild={{ mb: 0 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={600} color={valueColor}>{value}</Typography>
        </Stack>
    )
}