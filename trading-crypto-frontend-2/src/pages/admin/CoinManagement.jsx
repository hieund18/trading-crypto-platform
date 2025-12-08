// src/pages/admin/CoinManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, Avatar, Pagination, Stack, CircularProgress, 
  TextField, InputAdornment, MenuItem, Select, FormControl, IconButton, Tooltip, Button, ListItemText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; 
import RestartAltIcon from '@mui/icons-material/RestartAlt'; 
import CheckIcon from '@mui/icons-material/Check'; 

import AdminLayout from "../../components/admin/AdminLayout";
import PercentChange from "../../components/common/PercentChange"; 
import { getMarketsApi, updateCoinStatusApi } from "../../api/coinApi"; 
import { useCoinTicker } from "../../hooks/useCoinTicker"; 
import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

// 🔥 IMPORT MỚI
import ConfirmCoinStatusDialog from "../../components/admin/ConfirmCoinStatusDialog";
import CoinDetailModal from "../../components/admin/CoinDetailModal";
import AddCoinModal from "../../components/admin/AddCoinModal";

const TEXT_HEAD_COLOR = "#848e9c"; 
const COMMON_WEIGHT = 500;         
const ROW_FONT_SIZE = "0.95rem"; 

export default function CoinManagement() {
  const [initialCoins, setInitialCoins] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const [keyword, setKeyword] = useState(""); 
  const [filterStatus, setFilterStatus] = useState("ALL");

  // 🔥 STATE MODAL & DIALOG
  const [selectedCoin, setSelectedCoin] = useState(null); // Chi tiết
  const [confirmDialog, setConfirmDialog] = useState({ open: false, coin: null, loading: false }); // Xác nhận khóa

  const { toastSuccess, toastError, toastInfo } = useToast();

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const params = { 
        page: page, 
        size: 20, 
        sort: "marketCap,desc" 
      };
      if (keyword) params.keyword = keyword;
      if (filterStatus !== "ALL") params.isActive = filterStatus === "TRUE";

      const res = await getMarketsApi(params);
      
      if (res.code === 1000) {
        setInitialCoins(res.result.content || []);
        setTotalPages(res.result.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchCoins(); }, 500);
    return () => clearTimeout(timer);
  }, [page, keyword, filterStatus]);

  const liveCoins = useCoinTicker(initialCoins);

  const handleResetFilters = () => {
      setKeyword("");
      setFilterStatus("ALL");
      setPage(1);
  };

  // 🔥 1. Mở Dialog thay vì alert
  const handleClickToggle = (e, coin) => {
    e.stopPropagation(); // Ngăn mở modal chi tiết
    setConfirmDialog({ open: true, coin: coin, loading: false });
  };

  // 🔥 2. Xử lý API trong Dialog
  const handleConfirmStatus = async () => {
    const { coin } = confirmDialog;
    if (!coin) return;

    setConfirmDialog(prev => ({ ...prev, loading: true }));

    try {
      const res = await updateCoinStatusApi(coin.id);
      
      if (res.code === 1000) {
        const actionName = !coin.isActive ? "Kích hoạt" : "Vô hiệu hóa";
        toastSuccess(`Đã ${actionName} thành công!`);
        // Cập nhật state
        setInitialCoins(prev => prev.map(c => c.id === coin.id ? { ...c, isActive: !c.isActive } : c));
        setConfirmDialog({ open: false, coin: null, loading: false });
      } 
      else if (res.code === 1003) toastError("Bạn không có quyền thực hiện thao tác này!");
      else if (res.code === 5103) { toastError("Coin không tồn tại!"); fetchCoins(); }
      else toastError(res.message || "Thao tác thất bại");
    } catch (err) {
      const backendErr = err.response?.data;
      if (backendErr?.code === 1003) toastError("Bạn không có quyền thực hiện!");
      else toastError("Lỗi kết nối máy chủ");
    } finally {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateCoin = () => {
    setOpenAdd(true);
  };

  const actionButtonStyle = { 
    color: "text.primary", bgcolor: "action.hover", boxShadow: "none", 
    textTransform: "none", fontWeight: 600, borderRadius: 1, px: 2, py: 0.8, 
    minWidth: 'auto', border: '1px solid transparent', 
    "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" } 
  };
  
  const inputStyle = { bgcolor: "background.default", borderRadius: 1, "& .MuiOutlinedInput-root": { fontSize: "0.875rem", "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }, "& input::placeholder": { fontSize: "0.85rem" } };
  const menuItemSx = { display: "flex", justifyContent: "space-between", alignItems: "center", color: "text.secondary", py: 1.2, fontSize: "0.875rem", "&.Mui-selected": { bgcolor: "action.selected", color: "text.primary", fontWeight: 700 }, "& .MuiTypography-root": { fontSize: "0.875rem" } };
  const getStatusLabel = (val) => { if (val === "TRUE") return "Đang hoạt động"; if (val === "FALSE") return "Đã ẩn"; return "Tất cả"; };
  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };

  return (
    <AdminLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Quản lý Coin</Typography>
        <Button 
            variant="contained" 
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleCreateCoin} // 🔥 Gắn hàm mở modal
            sx={actionButtonStyle}
        >
            Thêm mới
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} displayEmpty sx={inputStyle} renderValue={(selected) => (<Box sx={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "center" }}><Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>Trạng thái</Typography><Typography fontWeight={600} color="text.primary" fontSize="0.875rem">{getStatusLabel(selected)}</Typography></Box>)}>
              <MenuItem value="ALL" sx={menuItemSx}><ListItemText primary="Tất cả" />{filterStatus === "ALL" && <CheckIcon fontSize="small" />}</MenuItem>
              <MenuItem value="TRUE" sx={menuItemSx}><ListItemText primary="Đang hoạt động" />{filterStatus === "TRUE" && <CheckIcon fontSize="small" />}</MenuItem>
              <MenuItem value="FALSE" sx={menuItemSx}><ListItemText primary="Đã ẩn (Inactive)" />{filterStatus === "FALSE" && <CheckIcon fontSize="small" />}</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleResetFilters} sx={{ ...actionButtonStyle, height: 40 }}>Đặt lại</Button>
          <Box flexGrow={1} />
          <TextField size="small" placeholder="Tìm kiếm Coin..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} /></InputAdornment>, }} sx={{ width: 280, ...inputStyle }} />
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "background.default", border: "none", borderRadius: 0, "& .MuiTableCell-root": { borderBottom: "1px solid", borderColor: "divider" } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerSx, pl: 0, width: '25%' }}>Tên Coin</TableCell>
              <TableCell align="right" sx={headerSx}>Giá</TableCell>
              <TableCell align="right" sx={headerSx}>Thay đổi (24h)</TableCell>
              <TableCell align="right" sx={headerSx}>Volume (24h)</TableCell>
              <TableCell align="right" sx={headerSx}>Vốn hóa</TableCell>
              <TableCell align="center" sx={headerSx}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ ...headerSx, pr: 0 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, borderBottom: "none" }}><CircularProgress /></TableCell></TableRow>
            ) : liveCoins.length === 0 ? (
               <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, borderBottom: "none" }}>Không tìm thấy coin nào</TableCell></TableRow>
            ) : (
              liveCoins.map((coin) => (
                <TableRow 
                    key={coin.id} 
                    hover 
                    // 🔥 3. CLICK ĐỂ XEM CHI TIẾT
                    onClick={() => setSelectedCoin(coin)}
                    sx={{ "&:last-child td": { borderBottom: 0 }, "&:hover": { bgcolor: "action.hover" }, cursor: "pointer" }}
                >
                  <TableCell sx={{ pl: 0 }}>
                     <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar src={coin.image} alt={coin.name} sx={{ width: 32, height: 32 }} />
                        <Box>
                            <Stack direction="row" alignItems="baseline" spacing={0.8}>
                                <Typography fontSize={ROW_FONT_SIZE} fontWeight={COMMON_WEIGHT} color="text.primary">{coin.symbol?.toUpperCase()}</Typography>
                                <Typography variant="caption" color="text.secondary">{coin.name}</Typography>
                            </Stack>
                            
                            {/* 🔥 4. SỬA MÀU BINANCE SYMBOL */}
                            {coin.binanceSymbol && (
                                <Tooltip title="Mã cặp trên Binance">
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary', display: 'block' }}>
                                        {coin.binanceSymbol.toUpperCase()}
                                    </Typography>
                                </Tooltip>
                            )}
                        </Box>
                     </Stack>
                  </TableCell>
                  
                  <TableCell align="right"><Typography fontSize={ROW_FONT_SIZE} fontWeight={COMMON_WEIGHT} color="text.primary">{formatPrice(coin.currentPrice)}</Typography></TableCell>
                  <TableCell align="right"><PercentChange value={coin.priceChangePercentage24h} sx={{ justifyContent: "flex-end", fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE }} /></TableCell>
                  <TableCell align="right"><Typography fontSize={ROW_FONT_SIZE} fontWeight={COMMON_WEIGHT} color="text.primary">{formatCompactCurrency(coin.totalVolume)}</Typography></TableCell>
                  <TableCell align="right"><Typography fontSize={ROW_FONT_SIZE} fontWeight={COMMON_WEIGHT} color="text.primary">{formatCompactCurrency(coin.marketCap)}</Typography></TableCell>
                  <TableCell align="center"><Chip label={coin.isActive ? "Active" : "Hidden"} color={coin.isActive ? "success" : "default"} size="small" variant={coin.isActive ? "filled" : "outlined"} sx={{ fontWeight: 600, minWidth: 60, height: 24, fontSize: "0.75rem" }} /></TableCell>
                  
                  <TableCell align="right" sx={{ pr: 0 }}>
                    <Tooltip title={coin.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
                        <IconButton 
                            // 🔥 5. GỌI HÀM TOGGLE CÓ CONFIRM
                            onClick={(e) => handleClickToggle(e, coin)}
                            color={coin.isActive ? "success" : "default"}
                            size="small"
                        >
                            <PowerSettingsNewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (<Box mt={3} display="flex" justifyContent="center"><Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" /></Box>)}

      <CoinDetailModal 
        open={!!selectedCoin} 
        onClose={() => setSelectedCoin(null)} 
        coin={selectedCoin} 
        onSuccess={fetchCoins} // 🔥 THÊM DÒNG NÀY
      />
      
      <ConfirmCoinStatusDialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} 
        onConfirm={handleConfirmStatus} 
        coin={confirmDialog.coin} 
        loading={confirmDialog.loading} 
      />

      <AddCoinModal 
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchCoins} // Refresh lại danh sách sau khi thêm
      />

    </AdminLayout>
  );
}