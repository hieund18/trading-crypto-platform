// src/pages/admin/TransactionManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, Pagination, Stack, TextField, InputAdornment,
  MenuItem, Select, FormControl, ListItemText, Button, Tabs, Tab, CircularProgress, alpha
} from "@mui/material"; 
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckIcon from '@mui/icons-material/Check'; 
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import AdminLayout from "../../components/admin/AdminLayout";
import { getAllTransactionsApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

import WithdrawalTab from "../../components/admin/WithdrawalTab";

const TEXT_HEAD_COLOR = "#848e9c"; 
const COLOR_UP = "#16c784";
const COLOR_DOWN = "#ea3943";

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTransactionConfig = (typeStr) => {
    const mainType = typeStr.split(" ")[0]; 
    switch (mainType) {
        case "DEPOSIT":
        case "TRANSFER_IN":
        case "TRADE_SELL":
        case "REFUND":
            return { color: COLOR_UP, sign: "+" };
        case "WITHDRAW":
        case "TRANSFER_OUT":
        case "TRADE_BUY":
            return { color: COLOR_DOWN, sign: "-" };
        default:
            return { color: "text.primary", sign: "" };
    }
};

export default function TransactionManagement() {
  const [activeTab, setActiveTab] = useState(0); 
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const { toastSuccess } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // 🔥 1. MẶC ĐỊNH HIỂN THỊ 20 DÒNG
      const params = { page, size: 20 }; 
      if (keyword) params.keyword = keyword;
      if (filterType !== "ALL") params.type = filterType;

      const res = await getAllTransactionsApi(params);
      if (res.code === 1000) {
        setData(res.result.content || []);
        setTotalPages(res.result.totalPage || 1); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
        const timer = setTimeout(() => { fetchTransactions(); }, 500);
        return () => clearTimeout(timer);
    }
  }, [page, keyword, filterType, activeTab]);

  const handleResetFilters = () => {
      setKeyword("");
      setFilterType("ALL");
      setPage(1);
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toastSuccess("Đã sao chép!");
  };

  // Styles
  const actionButtonStyle = { color: "text.primary", bgcolor: "action.hover", boxShadow: "none", textTransform: "none", fontWeight: 600, borderRadius: 1, px: 2, py: 0.8, minWidth: 'auto', border: '1px solid transparent', "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" } };
  const inputStyle = { bgcolor: "background.default", borderRadius: 1, "& .MuiOutlinedInput-root": { fontSize: "0.875rem", "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }, "& input::placeholder": { fontSize: "0.85rem" } };
  const menuItemSx = { display: "flex", justifyContent: "space-between", alignItems: "center", color: "text.secondary", py: 1.2, fontSize: "0.875rem", "&.Mui-selected": { bgcolor: "action.selected", color: "text.primary", fontWeight: 700 }, "& .MuiTypography-root": { fontSize: "0.875rem" } };
  
  const getTypeLabel = (val) => {
      const map = {
          "ALL": "Tất cả loại",
          "DEPOSIT": "Nạp tiền",
          "WITHDRAW": "Rút tiền",
          "TRANSFER": "Chuyển tiền",
          "TRADE_BUY": "Mua (Trade)",
          "TRADE_SELL": "Bán (Trade)",
          "REFUND": "Hoàn tiền"
      };
      return map[val] || val;
  };

  const renderTypeCell = (typeString) => {
    const parts = typeString.split(" ");
    const rawType = parts[0]; 
    const coinName = parts.slice(1).join(" "); 
    
    let displayLabel = rawType;
    if(rawType.includes("TRADE_BUY")) displayLabel = "Mua";
    else if(rawType.includes("TRADE_SELL")) displayLabel = "Bán";
    else if(rawType.includes("DEPOSIT")) displayLabel = "Nạp";
    else if(rawType.includes("WITHDRAW")) displayLabel = "Rút";
    else if(rawType.includes("TRANSFER")) displayLabel = "Chuyển";
    else if(rawType.includes("REFUND")) displayLabel = "Hoàn";

    const config = getTransactionConfig(rawType);

    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Chip 
            label={displayLabel} 
            size="small" 
            sx={{ 
                height: 24, fontWeight: 600, fontSize: "0.75rem", borderRadius: 1,
                bgcolor: alpha(config.color, 0.1), color: config.color,
                minWidth: 50, "& .MuiChip-label": { px: 1 }
            }} 
        />
        {coinName && <Typography variant="caption" fontWeight={600} color="text.primary">{coinName}</Typography>}
      </Stack>
    );
  };

  return (
    <AdminLayout>
      <Typography variant="h5" fontWeight={700} mb={2}>Quản lý giao dịch</Typography>

      {/* 🔥 3. SỬA STYLE TABS */}
      <Box sx={{ mb: 3 }}> {/* Bỏ borderBottom ở đây */}
        <Tabs 
            value={activeTab} 
            onChange={(e, v) => setActiveTab(v)} 
            sx={{ 
                // Gạch chân màu xanh (#3b82f6)
                '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' },
                '& .MuiTab-root': { 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    color: 'text.secondary',
                    // Khi chọn thì chữ màu text.primary (Trắng/Đen)
                    '&.Mui-selected': { color: 'text.primary' } 
                } 
            }}
        >
            <Tab label="Lịch sử giao dịch" />
            <Tab label="Yêu cầu rút tiền" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
            {/* FILTER BAR */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 260 }}>
                    <Select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        displayEmpty sx={inputStyle}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>Loại</Typography>
                                <Typography fontWeight={600} color="text.primary" fontSize="0.875rem">{getTypeLabel(selected)}</Typography>
                            </Box>
                        )}
                    >
                        <MenuItem value="ALL" sx={menuItemSx}><ListItemText primary="Tất cả loại" />{filterType === "ALL" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="DEPOSIT" sx={menuItemSx}><ListItemText primary="Nạp tiền" />{filterType === "DEPOSIT" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="WITHDRAW" sx={menuItemSx}><ListItemText primary="Rút tiền" />{filterType === "WITHDRAW" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="TRANSFER" sx={menuItemSx}><ListItemText primary="Chuyển tiền" />{filterType === "TRANSFER" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="TRADE_BUY" sx={menuItemSx}><ListItemText primary="Mua (Trade)" />{filterType === "TRADE_BUY" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="TRADE_SELL" sx={menuItemSx}><ListItemText primary="Bán (Trade)" />{filterType === "TRADE_SELL" && <CheckIcon fontSize="small" />}</MenuItem>
                        <MenuItem value="REFUND" sx={menuItemSx}><ListItemText primary="Hoàn tiền" />{filterType === "REFUND" && <CheckIcon fontSize="small" />}</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleResetFilters} sx={{ ...actionButtonStyle, height: 40 }}>Đặt lại</Button>

                <Box flexGrow={1} />

                <TextField 
                    size="small" placeholder="Tìm User ID, Transaction ID..." 
                    value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} /></InputAdornment> }}
                    sx={{ width: 300, ...inputStyle }}
                />
            </Box>

            {/* TABLE */}
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "background.default", border: "none", borderRadius: 0, "& .MuiTableCell-root": { borderBottom: "1px solid", borderColor: "divider" } }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pl: 0, width: '22%' }}>Giao dịch ID</TableCell>
                            <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, width: '22%' }}>User ID</TableCell>
                            <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, width: '12%' }}>Loại</TableCell>
                            
                            <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Số tiền</TableCell>
                            <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Số dư trước</TableCell>
                            <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Số dư sau</TableCell>
                            <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pr: 0 }}>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, borderBottom: "none" }}><CircularProgress /></TableCell></TableRow>
                        ) : data.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, borderBottom: "none" }}>Không tìm thấy giao dịch nào</TableCell></TableRow>
                        ) : (
                            data.map((item) => {
                                const config = getTransactionConfig(item.type);
                                return (
                                    <TableRow key={item.id} hover sx={{ "&:last-child td": { borderBottom: 0 }, "&:hover": { bgcolor: "action.hover" } }}>
                                        
                                        {/* Transaction ID */}
                                        <TableCell sx={{ pl: 0 }}>
                                            <Stack direction="row" alignItems="center" gap={0.5}>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                                    {item.id}
                                                </Typography>
                                                <Tooltip title="Sao chép">
                                                    <IconButton size="small" onClick={() => copyToClipboard(item.id)}>
                                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>

                                        {/* User ID */}
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" gap={0.5}>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.primary" 
                                                    sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}
                                                >
                                                    {item.userId}
                                                </Typography>
                                                <Tooltip title="Sao chép">
                                                    <IconButton size="small" onClick={() => copyToClipboard(item.userId)}>
                                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            {renderTypeCell(item.type)}
                                        </TableCell>

                                        {/* 🔥 2. SỐ TIỀN & SỐ DƯ: BỎ IN ĐẬM (fontWeight={600} -> 400/mặc định) */}
                                        <TableCell align="right">
                                            <Typography variant="body2" color={config.color}>
                                                {config.sign}{formatPrice(item.amount)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                                                {formatPrice(item.balanceBefore)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography variant="body2" color="text.primary">
                                                {formatPrice(item.balanceAfter)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right" sx={{ pr: 0 }}>
                                            <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                                                {formatDate(item.createdAt)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 1 && (
                <Box mt={3} display="flex" justifyContent="center">
                    <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
                </Box>
            )}
        </>
      )}

      {activeTab === 1 && (
          <WithdrawalTab />
      )}

    </AdminLayout>
  );
}