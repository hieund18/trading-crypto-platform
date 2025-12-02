// src/pages/history/TradeHistoryPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Container,
  Tabs, Tab, Pagination, Chip, Button, LinearProgress
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import { getMyTradeHistoryApi } from "../../api/orderApi";
import { formatPrice } from "../../utils/formatters";

const formatQuantity = (val) => val ? val.toLocaleString("en-US", { maximumFractionDigits: 6 }) : "0";
const formatDate = (dateString) => {
    if(!dateString) return "--";
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
const TEXT_HEAD_COLOR = "#848e9c"; 
const COMMON_WEIGHT = 500;         
const ROW_FONT_SIZE = "0.95rem";   

export default function TradeHistoryPage() {
  const nav = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = { page: page, size: 20 };
            if (type !== "ALL") params.type = type;
            const res = await getMyTradeHistoryApi(params);
            if (res.code === 1000) {
                setHistoryData(res.result.content);
                setTotalPages(res.result.totalPage);
            }
        } catch (error) { console.error("Failed history", error); } 
        finally { setLoading(false); }
    };
    fetchHistory();
  }, [page, type]);

  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };
  const cellSx = { fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE };

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* HEADER */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => nav(-1)} sx={{ color: 'text.secondary' }}>Quay lại</Button>
                <Typography variant="h5" fontWeight={700}>Lịch sử Đầu tư</Typography>
            </Box>
            
            <Tabs 
                value={type} 
                onChange={(e, v) => { setType(v); setPage(1); }} 
                variant="scrollable" 
                scrollButtons="auto"
                sx={{ 
                    minHeight: 36, 
                    '& .MuiTab-root': { 
                        minHeight: 36, 
                        fontSize: 14, 
                        fontWeight: 600, 
                        textTransform: 'none',
                        color: 'text.secondary', 
                        '&.Mui-selected': {
                            color: 'text.primary',
                        }
                    },
                }}
            >
                <Tab label="Tất cả" value="ALL" />
                <Tab label="Mua" value="BUY" />
                <Tab label="Bán" value="SELL" />
            </Tabs>
        </Box>

        <Box sx={{ width: "100%", height: 4, mb: 1 }}>
            {loading && <LinearProgress sx={{ bgcolor: "transparent" }} />}
        </Box>

        <TableContainer 
            component={Paper} 
            elevation={0} 
            sx={{ 
                bgcolor: "transparent", 
                border: "none", // Bỏ border container
                minHeight: 400, 
                opacity: loading ? 0.5 : 1, 
                transition: "opacity 0.2s", 
                pointerEvents: loading ? "none" : "auto" 
            }}
        >
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ ...headerSx, width: 50 }}>#</TableCell>
                        <TableCell sx={headerSx}>Cặp</TableCell>
                        <TableCell sx={headerSx}>Loại</TableCell>
                        <TableCell align="right" sx={headerSx}>Giá khớp</TableCell>
                        <TableCell align="right" sx={headerSx}>Số lượng</TableCell>
                        <TableCell align="right" sx={headerSx}>Tổng tiền</TableCell>
                        <TableCell align="right" sx={headerSx}>Thời gian</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && historyData.length === 0 ? (
                        <TableRow>
                            {/* 🔥 SỬA: Thêm borderBottom: "none" để bỏ kẻ ngang */}
                            <TableCell colSpan={7} align="center" sx={{ py: 10, borderBottom: "none" }}>
                                <CircularProgress size={30} />
                            </TableCell>
                        </TableRow>
                    ) : historyData.length === 0 ? (
                        <TableRow>
                            {/* 🔥 SỬA: Thêm borderBottom: "none" để bỏ kẻ ngang */}
                            <TableCell colSpan={7} align="center" sx={{ py: 10, borderBottom: "none" }}>
                                <Typography color="text.secondary">Không tìm thấy giao dịch nào.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        historyData.map((item, index) => (
                            <TableRow key={item.id} hover sx={{ "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                                <TableCell sx={{ color: TEXT_HEAD_COLOR }}>{(page - 1) * 20 + index + 1}</TableCell>
                                
                                <TableCell>
                                    <Typography fontSize="0.9rem" sx={{ textTransform: 'uppercase', fontWeight: 500, color: 'text.primary' }}>
                                        {item.coinId}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={item.type === 'BUY' ? 'MUA' : 'BÁN'} 
                                        size="small" 
                                        sx={{ 
                                            height: 24, fontWeight: 700, fontSize: "0.75rem", borderRadius: 1,
                                            color: item.type === 'BUY' ? '#16c784' : '#ea3943',
                                            bgcolor: item.type === 'BUY' ? 'rgba(22, 199, 132, 0.1)' : 'rgba(234, 57, 67, 0.1)'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell align="right"><Typography sx={cellSx}>{formatPrice(item.price)}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={cellSx}>{formatQuantity(item.quantity)}</Typography></TableCell>
                                
                                <TableCell align="right">
                                    <Typography sx={{ ...cellSx, fontWeight: 500 }}>
                                        {formatPrice(item.amount)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>{formatDate(item.createdAt)}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
            </Box>
        )}

      </Container>
    </MainLayout>
  );
}