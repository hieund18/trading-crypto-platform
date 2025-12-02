// src/pages/portfolio/PortfolioPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  LinearProgress,
  CircularProgress,
  Container,
  Button,
  Grid,
  useTheme,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HistoryIcon from '@mui/icons-material/History'; // Import Icon Lịch sử

// Components & Layout
import MainLayout from "../../components/layout/MainLayout";
import PercentChange from "../../components/common/PercentChange";

// API & Utils
import { getMyPortfolioApi, getMyTradeHistoryApi } from "../../api/orderApi";
import { formatPrice } from "../../utils/formatters";

// --- STYLE CONSTANTS ---
const TEXT_HEAD_COLOR = "#848e9c"; 
const COMMON_WEIGHT = 500;         
const ROW_FONT_SIZE = "0.95rem";   

const formatQuantity = (val) => val ? val.toLocaleString("en-US", { maximumFractionDigits: 6 }) : "0";
const formatAmount = (val) => val ? val.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0.00";
const formatDate = (dateString) => {
    if(!dateString) return "";
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export default function PortfolioPage() {
  const nav = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [portfolioData, setPortfolioData] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, histRes] = await Promise.all([
            getMyPortfolioApi(),
            getMyTradeHistoryApi({ page: 1, size: 5 }) 
        ]);

        if (portRes.code === 1000) setPortfolioData(portRes.result);
        if (histRes.code === 1000) setRecentHistory(histRes.result.content);

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- CHART CONFIG ---
  const chartConfig = useMemo(() => {
    let series = [1]; 
    let labels = ["Chưa có"];
    let colors = [isDark ? '#2B2F36' : '#E6E8EA']; 
    let totalLabel = "0 Coin";
    let isEmpty = true;

    if (portfolioData && portfolioData.coins && portfolioData.coins.length > 0) {
        series = portfolioData.coins.map(c => c.percentageAsset);
        labels = portfolioData.coins.map(c => c.symbol.toUpperCase());
        colors = ['#F6465D', '#0ECB81', '#F59E0B', '#2962FF', '#848E9C'];
        totalLabel = portfolioData.coins.length + ' Coin';
        isEmpty = false;
    }

    return {
      series: series,
      options: {
        chart: { type: 'donut', background: 'transparent' },
        labels: labels,
        colors: colors,
        stroke: { show: false },
        dataLabels: { 
            enabled: !isEmpty,
            formatter: function (val) { return val.toFixed(1) + "%" },
            style: { fontWeight: 'bold', colors: ['#fff'] },
            dropShadow: { enabled: true }
        },
        legend: { show: !isEmpty, position: 'right', labels: { colors: isDark ? '#EAECEF' : '#181A20' } },
        plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { color: isDark ? '#848E9C' : '#5E6673' }, value: { color: isDark ? '#EAECEF' : '#181A20', fontWeight: 700, formatter: (val) => isEmpty ? '' : parseFloat(val).toFixed(1) + '%' }, total: { show: true, label: 'Tài sản', color: isDark ? '#848E9C' : '#5E6673', formatter: () => totalLabel } } } } },
        tooltip: { enabled: !isEmpty, theme: isDark ? 'dark' : 'light', y: { formatter: (val) => val.toFixed(2) + '%' } }
      }
    };
  }, [portfolioData, isDark]);

  const totalCurrentAmount = portfolioData?.totalCurrentAmount || 0;
  const totalAmountChange = portfolioData?.totalAmountChange || 0;
  const totalPercentageChange = portfolioData?.totalPercentageChange || 0;
  const coins = portfolioData?.coins || [];
  const hasAssets = totalCurrentAmount > 0;
  const isProfit = totalAmountChange >= 0;

  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };
  const cellSx = { fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE };
  
  const cardSx = {
    p: 2.5, borderRadius: 3, bgcolor: "background.default", 
    border: "1px solid", borderColor: "divider"
  };

  const actionButtonStyle = {
    color: "text.primary",      // Chữ màu chính
    bgcolor: "action.hover",    // Nền xám nhạt
    boxShadow: "none",          // Bỏ bóng
    textTransform: "none",      // Không viết hoa
    fontWeight: 600,
    borderRadius: 1,            // Bo góc nhẹ (Hình chữ nhật)
    px: 2,
    py: 0.8,
    minWidth: 'auto',
    border: '1px solid transparent', // Để tránh nhảy layout khi hover
    "&:hover": {
        bgcolor: "action.selected", // Đậm hơn khi hover
        boxShadow: "none",
        borderColor: "divider"
    }
  };

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* 1. TỔNG QUAN & BIỂU ĐỒ */}
        <Grid container spacing={3} mb={4}>
            {/* Cột Trái: Thông tin số dư */}
            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <Paper elevation={0} sx={{ ...cardSx, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  
                  {/* HEADER: TITLE + HISTORY BUTTON */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Tổng tài sản ước tính
                    </Typography>
                    
                    {/* BUTTON LỊCH SỬ: STYLE BINANCE (XÁM + PRIMARY TEXT) */}
                    <Button 
                        onClick={() => nav('/trade-history')}
                        startIcon={<HistoryIcon />}
                        variant="contained" 
                        sx={actionButtonStyle} // Sử dụng style mới
                    >
                        Lịch sử
                    </Button>
                  </Box>
                  
                  {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={30} />
                      </Box>
                  ) : (
                      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
                        <Typography variant="h4" fontWeight={800} color="text.primary">{formatPrice(totalCurrentAmount)}</Typography>
                        {hasAssets && (
                          <Stack direction="row" alignItems="center" gap={1} sx={{ bgcolor: isProfit ? "rgba(22, 199, 132, 0.1)" : "rgba(234, 57, 67, 0.1)", px: 1.5, py: 0.5, borderRadius: 2 }}>
                            <Typography variant="body1" fontWeight={600} color={isProfit ? "#16c784" : "#ea3943"}>{isProfit ? "+" : ""}{formatAmount(totalAmountChange)}$</Typography>
                            <PercentChange value={totalPercentageChange} />
                          </Stack>
                        )}
                      </Stack>
                  )}
                  
                  {!loading && (
                    <Typography variant="caption" color="text.secondary" mt={2} display="block">
                        {hasAssets ? "* PNL (Lãi/Lỗ) được tính dựa trên giá trung bình mua vào." : "Bạn chưa có tài sản nào. Hãy bắt đầu giao dịch ngay!"}
                    </Typography>
                  )}
                </Paper>
            </Grid>

            {/* Cột Phải: Biểu đồ tròn */}
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Paper elevation={0} sx={{ ...cardSx, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <Box sx={{ width: '100%', minHeight: 200 }}>
                            <ReactApexChart options={chartConfig.options} series={chartConfig.series} type="donut" height={220} />
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>

        {/* 2. DANH SÁCH TÀI SẢN */}
        <Paper elevation={0} sx={{ ...cardSx, mb: 4, p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, pb: 1 }}><Typography variant="h6" fontWeight={700}>Tài sản của tôi</Typography></Box>
            <TableContainer sx={{ bgcolor: "transparent" }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerSx, width: 50, pl: 3 }}>#</TableCell>
                            <TableCell sx={headerSx}>Tài sản</TableCell>
                            <TableCell align="right" sx={headerSx}>Giá hiện tại</TableCell>
                            <TableCell align="right" sx={headerSx}>Giá TB</TableCell>
                            <TableCell align="right" sx={headerSx}>Số lượng</TableCell>
                            <TableCell align="right" sx={headerSx}>Tổng giá trị</TableCell>
                            <TableCell align="right" sx={headerSx}>PNL</TableCell>
                            <TableCell align="right" sx={{ ...headerSx, pr: 3 }}>Phân bổ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : coins.length > 0 ? (
                        coins.map((coin, index) => (
                            <TableRow key={coin.coinId} hover onClick={() => nav(`/trade/${coin.coinId}`)} sx={{ cursor: "pointer", height: 60, "&:hover": { bgcolor: "action.hover" }, "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                                <TableCell sx={{ color: TEXT_HEAD_COLOR, pl: 3 }}>{index + 1}</TableCell>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <Avatar src={coin.image} sx={{ width: 28, height: 28 }} />
                                        <Stack direction="row" alignItems="baseline" spacing={0.8}>
                                            <Typography fontSize={ROW_FONT_SIZE} fontWeight={COMMON_WEIGHT} color="text.primary">{coin.symbol.toUpperCase()}</Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={400}>{coin.name}</Typography>
                                        </Stack>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right"><Typography sx={cellSx}>{formatPrice(coin.currentPrice)}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={{ ...cellSx, color: "text.secondary" }}>{formatPrice(coin.buyPrice)}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={cellSx}>{formatQuantity(coin.quantity)}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={{ ...cellSx, fontWeight: 500 }}>{formatPrice(coin.currentAmount)}</Typography></TableCell>
                                <TableCell align="right">
                                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                                        <Typography sx={{ ...cellSx, fontWeight: 500 }} color={coin.amountChange >= 0 ? "#16c784" : "#ea3943"}>{coin.amountChange >= 0 ? "+" : ""}{formatAmount(coin.amountChange)}$</Typography>
                                        <PercentChange value={coin.percentageChange} sx={{ fontWeight: COMMON_WEIGHT, fontSize: "0.9rem" }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ width: 150, pr: 3 }}>
                                    <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                                        <Typography variant="caption" fontWeight={600} color="text.primary">{coin.percentageAsset.toFixed(1)}%</Typography>
                                        <LinearProgress variant="determinate" value={coin.percentageAsset} sx={{ width: 60, height: 6, borderRadius: 5, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: "primary.main" } }} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8 }}><Typography color="text.secondary">Bạn chưa sở hữu tài sản nào.</Typography><Button variant="outlined" sx={{ mt: 2 }} onClick={() => nav('/markets')}>Khám phá thị trường</Button></TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

        {/* 3. GIAO DỊCH GẦN ĐÂY */}
        <Paper elevation={0} sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Giao dịch gần đây</Typography>
                
                {/* Button "Xem tất cả" - Chữ màu Text Primary (Trắng/Đen) */}
                <Button 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={() => nav('/trade-history', { state: { fromRecent: true } })} 
                    size="small"
                    sx={{ 
                        color: "text.primary", // <-- Màu chữ thường (trắng/đen)
                        fontWeight: 600
                    }}
                >
                    Xem tất cả
                </Button>
            </Box>
            <TableContainer sx={{ bgcolor: "transparent" }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerSx, width: 50, pl: 3 }}>#</TableCell>
                            <TableCell sx={headerSx}>Cặp</TableCell>
                            <TableCell sx={headerSx}>Loại</TableCell>
                            <TableCell align="right" sx={headerSx}>Giá khớp</TableCell>
                            <TableCell align="right" sx={headerSx}>Số lượng</TableCell>
                            <TableCell align="right" sx={headerSx}>Tổng tiền</TableCell>
                            <TableCell align="right" sx={{ ...headerSx, pr: 3 }}>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : recentHistory.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Chưa có giao dịch nào gần đây.</Typography></TableCell></TableRow>
                        ) : (
                            recentHistory.map((item, index) => (
                                <TableRow key={item.id} hover sx={{ "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                                    <TableCell sx={{ color: TEXT_HEAD_COLOR, pl: 3 }}>{index + 1}</TableCell>
                                    <TableCell><Typography fontSize="0.9rem" sx={{ textTransform: 'uppercase', fontWeight: 500, color: 'text.primary' }}>{item.coinId}</Typography></TableCell>
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
                                    <TableCell align="right"><Typography sx={{ ...cellSx, fontWeight: 500 }}>{formatPrice(item.amount)}</Typography></TableCell>
                                    <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.9rem", pr: 3 }}>{formatDate(item.createdAt)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

      </Container>
    </MainLayout>
  );
}