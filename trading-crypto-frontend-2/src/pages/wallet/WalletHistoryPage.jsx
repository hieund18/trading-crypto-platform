// src/pages/wallet/WalletHistoryPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Container,
  Tabs, Tab, Pagination, Button, LinearProgress, Chip, Stack, alpha
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import WithdrawalRequestTable from "../../components/wallet/WithdrawalRequestTable";
import { getMyWalletTransactionApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";

// --- CONSTANTS ---
const COLOR_UP = "#16c784";
const COLOR_DOWN = "#ea3943";
const TEXT_HEAD_COLOR = "#848e9c"; 
const COMMON_WEIGHT = 500;         
const ROW_FONT_SIZE = "0.95rem";   

const formatDate = (dateString) => {
    if(!dateString) return "--";
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

const getTransactionConfig = (type) => {
    const key = type.split(" ")[0];
    switch (key) {
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

export default function WalletHistoryPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [mainTab, setMainTab] = useState(0);

  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if(location.state?.tab === 1) {
         setMainTab(1);
     }
  }, [location.state]);

  useEffect(() => {
    if (mainTab !== 0) return;
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = { page: page, size: 20 };
            if (type !== "ALL") params.type = type;
            
            const res = await getMyWalletTransactionApi(params);
            if (res.code === 1000) {
                setHistoryData(res.result.content);
                setTotalPages(res.result.totalPage);
            }
        } catch (error) { console.error("Failed history", error); } 
        finally { setLoading(false); }
    };
    fetchHistory();
  }, [page, type, mainTab]);

  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };
  const cellSx = { fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE };

  const renderTypeCell = (typeString) => {
    const parts = typeString.split(" ");
    const rawType = parts[0]; 
    const coinName = parts.slice(1).join(" "); 
    
    let displayLabel = rawType;
    if(rawType === "TRADE_BUY") displayLabel = "Mua";
    else if(rawType === "TRADE_SELL") displayLabel = "Bán";
    else if(rawType === "DEPOSIT") displayLabel = "Nạp";
    else if(rawType === "WITHDRAW") displayLabel = "Rút";
    else if(rawType === "TRANSFER_IN") displayLabel = "Nhận";
    else if(rawType === "TRANSFER_OUT") displayLabel = "Chuyển";
    else if(rawType === "REFUND") displayLabel = "Hoàn";
    
    const config = getTransactionConfig(rawType);

    return (
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Chip 
            label={displayLabel} 
            size="small" 
            sx={{ 
                height: 28, 
                fontWeight: 500, 
                fontSize: ROW_FONT_SIZE, 
                borderRadius: 1.5,
                bgcolor: alpha(config.color, 0.1), 
                color: config.color,
                minWidth: 60,
                "& .MuiChip-label": { px: 1, paddingBottom: "2px" }
            }} 
        />
        {coinName && <Typography sx={cellSx} color="text.primary">{coinName}</Typography>}
      </Stack>
    );
  };

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* HEADER */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => nav('/wallet')} sx={{ color: 'text.secondary' }}>Quay lại Ví</Button>
                <Typography variant="h5" fontWeight={700}>Lịch sử Tài sản</Typography>
            </Box>
            
            {/* 🔥 SỬA 1: Bỏ borderBottom ở Tabs */}
            <Tabs 
                value={mainTab} 
                onChange={(e, v) => setMainTab(v)}
                sx={{ 
                    // borderBottom: 1, borderColor: 'divider',  <-- ĐÃ XÓA DÒNG NÀY
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '1rem', mr: 2,
                        '&.Mui-selected': { color: 'text.primary' }
                     }
                }}
            >
                <Tab label="Biến động số dư" />
                <Tab label="Lịch sử Rút tiền" />
            </Tabs>
        </Box>

        {mainTab === 0 && (
            <>
                <Box sx={{ mb: 3 }}>
                    <Tabs 
                        value={type} 
                        onChange={(e, v) => { setType(v); setPage(1); }} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            minHeight: 36, 
                            '& .MuiTab-root': { 
                                minHeight: 36, fontSize: 14, fontWeight: 600, textTransform: 'none', color: 'text.secondary',
                                '&.Mui-selected': { color: 'text.primary' }
                            }
                        }}
                    >
                        <Tab label="Tất cả" value="ALL" />
                        <Tab label="Nạp tiền" value="DEPOSIT" />
                        <Tab label="Rút tiền" value="WITHDRAW" />
                        <Tab label="Chuyển tiền" value="TRANSFER_OUT" />
                        <Tab label="Nhận tiền" value="TRANSFER_IN" />
                        <Tab label="Mua" value="TRADE_BUY" />
                        <Tab label="Bán" value="TRADE_SELL" />
                        <Tab label="Hoàn tiền" value="REFUND" />
                    </Tabs>
                </Box>

                <Box sx={{ width: "100%", height: 4, mb: 1 }}>
                    {loading && <LinearProgress sx={{ bgcolor: "transparent" }} />}
                </Box>

                {/* 🔥 SỬA 2: Bỏ border và bgcolor ở TableContainer */}
                <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                        bgcolor: "transparent", // <-- Trong suốt
                        border: "none",         // <-- Bỏ viền
                        borderRadius: 0,        // <-- Bỏ bo góc thừa
                        minHeight: 400 
                    }}
                >
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...headerSx, width: 50, pl: 3 }}>#</TableCell>
                                <TableCell sx={headerSx}>Loại giao dịch</TableCell>
                                <TableCell align="right" sx={headerSx}>Số tiền</TableCell>
                                <TableCell align="right" sx={headerSx}>Số dư sau GD</TableCell>
                                <TableCell align="right" sx={{ ...headerSx, pr: 3 }}>Thời gian</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && historyData.length === 0 ? (
                                <TableRow>
                                    {/* 🔥 SỬA 3: Bỏ borderBottom khi loading */}
                                    <TableCell colSpan={5} align="center" sx={{ py: 10, borderBottom: "none" }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : historyData.length === 0 ? (
                                <TableRow>
                                    {/* 🔥 SỬA 3: Bỏ borderBottom khi không có dữ liệu */}
                                    <TableCell colSpan={5} align="center" sx={{ py: 10, borderBottom: "none" }}>
                                        <Typography color="text.secondary">Chưa có giao dịch nào.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                historyData.map((item, index) => {
                                    const config = getTransactionConfig(item.type);
                                    return (
                                        <TableRow key={item.id} hover sx={{ "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                                            <TableCell sx={{ color: TEXT_HEAD_COLOR, pl: 3 }}>{(page - 1) * 20 + index + 1}</TableCell>
                                            <TableCell>{renderTypeCell(item.type)}</TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ ...cellSx, fontWeight: 500 }} color={config.color}>
                                                    {config.sign}{formatPrice(item.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ ...cellSx, color: "text.primary" }}>{formatPrice(item.balanceAfter)}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.9rem", pr: 3 }}>{formatDate(item.createdAt)}</TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
                    </Box>
                )}
            </>
        )}

        {mainTab === 1 && (
            <Box sx={{ mt: 2 }}>
                <WithdrawalRequestTable />
            </Box>
        )}

      </Container>
    </MainLayout>
  );
}