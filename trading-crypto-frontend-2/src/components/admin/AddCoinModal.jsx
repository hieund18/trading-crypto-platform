// src/components/admin/AddCoinModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Divider, Stack, 
  Autocomplete, TextField, CircularProgress, Box, Avatar, useTheme
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { searchCoinGeckoApi, addCoinToMarketApi } from "../../api/coinApi";
import { useToast } from "../../utils/toast";

export default function AddCoinModal({ open, onClose, onSuccess }) {
  const { toastSuccess, toastError, toastWarning } = useToast();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";

  // State
  const [options, setOptions] = useState([]); // Danh sách gợi ý từ CoinGecko
  const [selectedCoin, setSelectedCoin] = useState(null); // Coin đang chọn
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset khi mở modal
  useEffect(() => {
    if (open) {
      setOptions([]);
      setSelectedCoin(null);
      setSubmitting(false);
    }
  }, [open]);

  // Hàm tìm kiếm (gõ đến đâu tìm đến đó)
  const handleSearch = async (e, value) => {
    if (!value) {
        setOptions([]);
        return;
    }
    setLoadingSearch(true);
    try {
        const res = await searchCoinGeckoApi(value);
        if (res.code === 1000) {
            setOptions(res.result.content || []);
        }
    } catch (err) {
        console.error("Search error", err);
    } finally {
        setLoadingSearch(false);
    }
  };

  // Hàm Submit thêm coin
  const handleAddCoin = async () => {
    if (!selectedCoin) {
        toastWarning("Vui lòng chọn một đồng coin!");
        return;
    }

    setSubmitting(true);
    try {
        const res = await addCoinToMarketApi(selectedCoin.id);

        if (res.code === 1000) {
            const newCoin = res.result;
            
            // 🔥 LOGIC THÔNG BÁO THEO YÊU CẦU
            if (!newCoin.binanceSymbol) {
                toastWarning(`Đã thêm ${newCoin.name}, nhưng cần cấu hình Binance Symbol để lấy giá!`);
            } else {
                toastSuccess(`Thêm ${newCoin.name} thành công!`);
            }

            onSuccess(); // Refresh list coin bên ngoài
            onClose();   // Đóng modal
        } 
        else if (res.code === 1003) toastError("Bạn không có quyền thực hiện!");
        else if (res.code === 5101) toastError("Coin ID không hợp lệ hoặc không tìm thấy!");
        else if (res.code === 5102) toastError("Coin này đã tồn tại trong hệ thống!");
        else toastError(res.message || "Thêm thất bại");

    } catch (err) {
        const backendErr = err.response?.data;
        if (backendErr?.code === 5102) toastError("Coin này đã tồn tại!");
        else toastError("Lỗi kết nối máy chủ");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!submitting ? onClose : undefined} 
      maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none", bgcolor: isDark ? CUSTOM_DARK_BG : "background.paper" } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Thêm Coin Mới</Typography>
        <IconButton onClick={onClose} disabled={submitting}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3, minHeight: 300 }}>
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                Tìm kiếm coin từ nguồn dữ liệu CoinGecko để thêm vào sàn.
            </Typography>

            <Autocomplete
                options={options}
                getOptionLabel={(option) => `${option.name} (${option.symbol?.toUpperCase()})`}
                filterOptions={(x) => x} // Tắt filter client side để dùng server side search
                loading={loadingSearch}
                onInputChange={(event, newInputValue) => {
                    // Debounce nhẹ hoặc gọi trực tiếp (ở đây gọi trực tiếp cho mượt, API CoinGecko search khá nhanh)
                    // Nếu muốn tối ưu có thể dùng setTimeout
                    if (event && event.type === 'change') {
                        const timer = setTimeout(() => handleSearch(event, newInputValue), 300);
                        return () => clearTimeout(timer);
                    }
                }}
                onChange={(event, newValue) => setSelectedCoin(newValue)}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Nhập tên hoặc ký hiệu coin (VD: bitcoin)"
                        fullWidth
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loadingSearch ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" fontWeight={600}>
                                {option.name} <span style={{ color: 'gray' }}>({option.symbol?.toUpperCase()})</span>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                ID: {option.id}
                            </Typography>
                        </Box>
                    </li>
                )}
            />

            {/* Preview coin đã chọn */}
            {selectedCoin && (
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>Coin sẽ thêm:</Typography>
                    <Stack direction="row" alignItems="center" gap={2}>
                        {/* CoinGecko search API đôi khi không trả về ảnh ngay, nếu có thì hiện, ko thì hiện chữ cái */}
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedCoin.symbol[0].toUpperCase()}</Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight={700}>{selectedCoin.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{selectedCoin.id}</Typography>
                        </Box>
                    </Stack>
                </Box>
            )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={submitting}>
            Hủy
        </Button>
        <Button 
            onClick={handleAddCoin} 
            variant="contained" 
            startIcon={submitting ? <CircularProgress size={20} color="inherit"/> : <AddCircleOutlineIcon />}
            disabled={submitting || !selectedCoin}
            sx={{ fontWeight: 600 }}
        >
            {submitting ? "Đang thêm..." : "Thêm Coin"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}