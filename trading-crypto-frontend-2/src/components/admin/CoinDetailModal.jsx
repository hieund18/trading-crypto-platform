// src/components/admin/CoinDetailModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, Box, Chip, Divider, Avatar, 
  IconButton, useTheme, Autocomplete, TextField, CircularProgress, Stack, Tooltip
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import { useToast } from "../../utils/toast";
import { searchBinanceSymbolsApi, updateCoinBinanceSymbolApi } from "../../api/coinApi";

// Hàm format ngày giờ
const formatDate = (dateString) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit' // Bỏ giờ phút cho gọn nếu muốn
  });
};

export default function CoinDetailModal({ open, onClose, coin, onSuccess }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const CUSTOM_DARK_BG = "#1C2024";
  const { toastSuccess, toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset state khi mở modal
  useEffect(() => {
    if (open) {
        setIsEditing(false);
        setSelectedSymbol(null);
        setSymbolOptions([]);
    }
  }, [open, coin]);

  // Hàm tìm kiếm (hoặc load mặc định)
  const handleSearchSymbol = async (e, value) => {
      setLoadingSearch(true);
      try {
          // Nếu value rỗng, API sẽ trả về list mặc định (top symbols)
          const res = await searchBinanceSymbolsApi(value || "");
          if (res.code === 1000) {
              setSymbolOptions(res.result.content || []);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingSearch(false);
      }
  };

  // Khi bấm nút sửa -> Load luôn danh sách
  const handleStartEdit = () => {
      setIsEditing(true);
      handleSearchSymbol(null, ""); 
  };

  const handleErrorResponse = (data) => {
      switch (data.code) {
          case 1003: toastError("Bạn không có quyền thực hiện!"); break;
          case 5103: toastError("Coin không tồn tại!"); break;
          case 5006: toastError("Symbol này đã được sử dụng cho coin khác!"); break;
          case 5005: toastError("Symbol không hợp lệ!"); break;
          default: toastError(data.message || "Cập nhật thất bại");
      }
  };

  const handleSaveSymbol = async () => {
      if (!selectedSymbol) {
          setIsEditing(false);
          return;
      }
      
      setSaving(true);
      try {
          const res = await updateCoinBinanceSymbolApi(coin.id, selectedSymbol.symbol);
          
          if (res.code === 1000) {
              toastSuccess("Cập nhật Binance Symbol thành công!");
              setIsEditing(false);
              if (onSuccess) onSuccess(); 
          } else {
              // Trường hợp API trả về 200 OK nhưng code != 1000
              handleErrorResponse(res);
          }
      } catch (err) {
          // 🔥 SỬA LỖI: Kiểm tra response từ server trước khi báo lỗi kết nối
          if (err.response && err.response.data) {
              handleErrorResponse(err.response.data);
          } else {
              console.error(err);
              toastError("Lỗi kết nối máy chủ");
          }
      } finally {
          setSaving(false);
      }
  };

  if (!coin) return null;

  // Style nút giống "Đặt lại" (Gray Button)
  const actionButtonStyle = { 
    color: "text.primary", bgcolor: "action.hover", boxShadow: "none", 
    textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2, py: 1, 
    border: '1px solid transparent', 
    "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" } 
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
            <Avatar src={coin.image} sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }} />
            <Box>
                <Typography variant="h6" fontWeight={700}>
                    {coin.name} 
                    <span style={{ color: theme.palette.text.secondary, fontSize: '0.9rem', marginLeft: 6 }}>
                        ({coin.symbol?.toUpperCase()})
                    </span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>ID: {coin.id}</Typography>
            </Box>
        </Box>
        <IconButton onClick={onClose} disabled={saving}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={4}>
            
            {/* --- CỘT TRÁI: THÔNG TIN CƠ BẢN & GIÁ --- */}
            <Grid size={{ xs: 12, md: 6 }}>
                <SectionTitle title="Thông tin chung" />
                
                {/* RANK & TRẠNG THÁI */}
                <Box mb={2} display="flex" gap={1}>
                    <Chip label={`Rank #${coin.marketCapRank}`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                    <Chip 
                        label={coin.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"} 
                        color={coin.isActive ? "success" : "default"} 
                        size="small" sx={{ fontWeight: 600 }}
                    />
                </Box>

                {/* BINANCE SYMBOL (INLINE EDIT) */}
                <Box mb={1.5} display="flex" justifyContent="space-between" alignItems="center" height={40}>
                    <Typography variant="body2" color="text.secondary">Binance Symbol</Typography>
                    
                    {!isEditing ? (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                {coin.binanceSymbol || "---"}
                            </Typography>
                            <Tooltip title="Chỉnh sửa">
                                <IconButton size="small" onClick={handleStartEdit} sx={{ ml: 0.5 }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ) : (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Autocomplete
                                openOnFocus // 🔥 Tự động mở list khi click vào
                                options={symbolOptions}
                                getOptionLabel={(option) => option.symbol}
                                loading={loadingSearch}
                                onInputChange={handleSearchSymbol} 
                                onChange={(e, val) => setSelectedSymbol(val)}
                                size="small"
                                sx={{ width: 180 }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} placeholder="Tìm symbol..." 
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingSearch ? <CircularProgress color="inherit" size={16} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        // Style input nhỏ gọn
                                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.85rem", paddingRight: "30px !important" } }}
                                    />
                                )}
                            />
                            <IconButton size="small" onClick={handleSaveSymbol} disabled={saving} color="primary">
                                {saving ? <CircularProgress size={18} /> : <SaveIcon fontSize="small" />}
                            </IconButton>
                            <IconButton size="small" onClick={() => setIsEditing(false)} disabled={saving} color="error">
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )}
                </Box>

                <InfoRow label="Ngày tạo" value={formatDate(coin.createdAt)} />
                <InfoRow label="Cập nhật" value={formatDate(coin.updatedAt)} />

                <Divider sx={{ my: 2 }} />
                
                <SectionTitle title="Biến động giá" noMb />
                <InfoRow label="Giá hiện tại" value={formatPrice(coin.currentPrice)} isHighlight />
                <InfoRow label="Cao nhất 24h" value={formatPrice(coin.high24h)} />
                <InfoRow label="Thấp nhất 24h" value={formatPrice(coin.low24h)} />
                <InfoRow label="Thay đổi giá (24h)" value={`${formatPrice(coin.priceChange24h)} (${coin.priceChangePercentage24h?.toFixed(2)}%)`} isColorScale={coin.priceChangePercentage24h} />
            </Grid>

            {/* --- CỘT PHẢI: THỐNG KÊ THỊ TRƯỜNG & SUPPLY --- */}
            <Grid size={{ xs: 12, md: 6 }}>
                <SectionTitle title="Thống kê thị trường" />
                
                <InfoRow label="Vốn hóa" value={formatCompactCurrency(coin.marketCap)} />
                <InfoRow label="Thay đổi Vốn hóa (24h)" value={`${formatCompactCurrency(coin.marketCapChange24h)} (${coin.marketCapChangePercentage24h?.toFixed(2)}%)`} isColorScale={coin.marketCapChangePercentage24h} />
                <InfoRow label="Volume 24h" value={formatCompactCurrency(coin.totalVolume)} />
                
                <Divider sx={{ my: 2 }} />
                
                <SectionTitle title="Nguồn cung & Lịch sử" noMb />
                <InfoRow label="Lưu hành (Circulating)" value={formatCompactCurrency(coin.circulatingSupply)} />
                <InfoRow label="Tổng cung (Total)" value={formatCompactCurrency(coin.totalSupply)} />
                <InfoRow label="Cung tối đa (Max)" value={coin.maxSupply ? formatCompactCurrency(coin.maxSupply) : "∞"} />
                
                <Box mt={2} p={1.5} bgcolor="action.hover" borderRadius={2}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">Đỉnh lịch sử (ATH)</Typography>
                        <Box textAlign="right">
                            <Typography variant="body2" fontWeight={600}>{formatPrice(coin.ath)}</Typography>
                            <Typography variant="caption" color="error">{coin.athChangePercentage?.toFixed(2)}% • {formatDate(coin.athDate)}</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Đáy lịch sử (ATL)</Typography>
                        <Box textAlign="right">
                            <Typography variant="body2" fontWeight={600}>{formatPrice(coin.atl)}</Typography>
                            <Typography variant="caption" color="success.main">+{coin.atlChangePercentage?.toFixed(2)}% • {formatDate(coin.atlDate)}</Typography>
                        </Box>
                    </Stack>
                </Box>
            </Grid>
            
            <Grid size={{ xs: 12 }}><Divider /></Grid>

            {/* BUTTON LINK */}
            <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button 
                    endIcon={<OpenInNewIcon />}
                    href={`/trade/${coin.id}`} 
                    target="_blank"
                    sx={actionButtonStyle} // 🔥 Dùng style nút xám
                >
                    Xem trang giao dịch
                </Button>
            </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- COMPONENTS CON ---
function SectionTitle({ title, noMb }) {
    return (
        <Typography variant="subtitle1" fontWeight={700} color="text.primary" mb={noMb ? 1 : 2} sx={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 0.5, opacity: 0.8 }}>
            {title}
        </Typography>
    );
}

function InfoRow({ label, value, customValue, isMonospace, isHighlight, isColorScale }) {
    let color = "text.primary";
    if (isHighlight) color = "primary.main";
    if (isColorScale !== undefined) color = isColorScale >= 0 ? "#16c784" : "#ea3943"; // Xanh/Đỏ

    return (
        <Box mb={1.2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            {customValue ? customValue : (
                <Stack direction="row" alignItems="center" gap={0.5}>
                    {isColorScale !== undefined && (isColorScale >= 0 ? <TrendingUpIcon sx={{ fontSize: 16, color }} /> : <TrendingDownIcon sx={{ fontSize: 16, color }} />)}
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: isMonospace ? 'monospace' : 'inherit', color: color }}>
                        {value || "---"}
                    </Typography>
                </Stack>
            )}
        </Box>
    );
}