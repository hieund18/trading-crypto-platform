// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Grid, Paper, Stack, Avatar, 
  CircularProgress, useTheme, Button, IconButton, Chip 
} from "@mui/material";
import AdminLayout from "../../components/admin/AdminLayout";
import { useNavigate } from "react-router-dom";

// Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaidIcon from '@mui/icons-material/Paid';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Utils & API
import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import { getAllTransactionsApi } from "../../api/walletApi";
import { getAllUsersApi } from "../../api/userApi";
import { getMarketsApi } from "../../api/coinApi";
import { getAllWithdrawalsApi } from "../../api/walletApi";
import { getVolumeChartApi } from "../../api/orderApi";

// 🔥 IMPORT BIỂU ĐỒ MỚI
import DashboardChart from "../../components/admin/DashboardChart";

export default function AdminDashboard() {
  const theme = useTheme();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalVolume: 0,
      activeCoins: 0,
      pendingWithdrawals: 0
  });
  
  const [recentTrans, setRecentTrans] = useState([]);

  // Fetch Stats Tổng quan
  useEffect(() => {
    const fetchStats = async () => {
        try {
            // Lấy volume 7 ngày để hiện tổng quan (hoặc dùng API tổng nếu có)
            // Lưu ý: Logic này chỉ để hiện con số tổng trên thẻ, không ảnh hưởng biểu đồ
            const now = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 6);
            
            const paramsVol = {
                timeType: "DAY",
                from: lastWeek.toISOString(),
                to: now.toISOString()
            };

            const [usersRes, transRes, coinsRes, withdrawRes, volRes] = await Promise.all([
                getAllUsersApi({ page: 1, size: 1 }),
                getAllTransactionsApi({ page: 1, size: 5 }),
                getMarketsApi({ isActive: true, page: 1, size: 1 }),
                getAllWithdrawalsApi({ status: "PENDING", page: 1, size: 1 }),
                getVolumeChartApi(paramsVol)
            ]);

            let totalVol = 0;
            if (volRes.code === 1000 && volRes.result) {
                totalVol = volRes.result.reduce((acc, curr) => acc + (curr.totalVolume || 0), 0);
            }

            setStats({
                totalUsers: usersRes.result?.totalElements || 0,
                totalVolume: totalVol,
                activeCoins: coinsRes.result?.totalElements || 0,
                pendingWithdrawals: withdrawRes.result?.totalElement || 0
            });

            if (transRes.code === 1000) setRecentTrans(transRes.result.content || []);

        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) {
      return (
        <AdminLayout>
            <Box height="80vh" display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
            </Box>
        </AdminLayout>
      );
  }

  // Style cho Card (để chìm vào nền)
  const cardSx = {
      p: 3, borderRadius: 3, height: '100%',
      bgcolor: "background.default", 
      border: "1px solid", borderColor: "divider",
      position: 'relative', overflow: 'hidden'
  };

  return (
    <AdminLayout>
      <Box pb={4}>
        {/* WELCOME SECTION */}
        <Paper 
            elevation={0}
            sx={{
                p: 4, mb: 4, borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: '#fff', position: 'relative', overflow: 'hidden'
            }}
        >
            <Box position="relative" zIndex={2}>
                <Typography variant="h4" fontWeight={800} mb={1}>Xin chào, Admin 👋</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Hệ thống đang hoạt động ổn định.</Typography>
            </Box>
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Box sx={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Paper>

        {/* STAT CARDS */}
        <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Tổng người dùng" value={stats.totalUsers} icon={<PeopleAltIcon />} color="#3b82f6" sx={cardSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Tổng Volume (7 ngày)" value={formatCompactCurrency(stats.totalVolume)} icon={<PaidIcon />} color="#16c784" sx={cardSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Coin đang hoạt động" value={stats.activeCoins} icon={<CurrencyBitcoinIcon />} color="#F59E0B" sx={cardSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard title="Rút tiền chờ duyệt" value={stats.pendingWithdrawals} icon={<AccountBalanceWalletIcon />} color={stats.pendingWithdrawals > 0 ? "#ea3943" : "#16c784"} isAlert={stats.pendingWithdrawals > 0} sx={cardSx} />
            </Grid>
        </Grid>

        {/* CHART & LIST */}
        <Grid container spacing={3}>
            {/* Cột Trái: Chart (Dùng Component Mới) */}
            <Grid size={{ xs: 12, lg: 8 }}>
                <DashboardChart />
            </Grid>

            {/* Cột Phải: List */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <Paper elevation={0} sx={{ ...cardSx, p: 0 }}> 
                    <Box p={3} pb={1} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>Giao dịch mới</Typography>
                        <IconButton size="small" onClick={() => nav('/admin/transactions')}><ArrowForwardIcon fontSize="small" /></IconButton>
                    </Box>
                    <Stack spacing={0}>
                        {recentTrans.map((item, index) => {
                            const isDeposit = item.type.includes("DEPOSIT");
                            const isWithdraw = item.type.includes("WITHDRAW");
                            const color = isDeposit ? "#16c784" : (isWithdraw ? "#ea3943" : "text.primary");
                            const displayType = item.type.split(' ')[0];
                            return (
                                <Box key={item.id} sx={{ p: 2, borderBottom: index !== recentTrans.length - 1 ? '1px solid' : 'none', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', "&:hover": { bgcolor: 'action.hover' } }}>
                                    <Stack direction="row" gap={1.5} alignItems="center">
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: isDeposit ? 'rgba(22, 199, 132, 0.1)' : 'rgba(234, 57, 67, 0.1)', color: isDeposit ? '#16c784' : '#ea3943' }}>
                                            {isDeposit ? <PaidIcon fontSize="small"/> : <AccountBalanceWalletIcon fontSize="small"/>}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>{displayType}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(item.createdAt).toLocaleTimeString()}</Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="body2" fontWeight={700} color={color}>{isDeposit ? "+" : ""}{formatPrice(item.amount)}</Typography>
                                </Box>
                            )
                        })}
                        {recentTrans.length === 0 && <Box p={3} textAlign="center" color="text.secondary">Chưa có giao dịch nào.</Box>}
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

// Sub Component StatCard
function StatCard({ title, value, icon, color, isAlert, sx }) {
    return (
        <Paper elevation={0} sx={sx}>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>{title}</Typography>
                    <Typography variant="h4" fontWeight={800} color="text.primary">{value}</Typography>
                    {isAlert && <Chip label="Cần xử lý" size="small" sx={{ mt: 1, height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'error.main', color: 'white' }} />}
                </Box>
                <Avatar variant="rounded" sx={{ bgcolor: color, width: 48, height: 48, boxShadow: `0 4px 12px ${color}66` }}>
                    {React.cloneElement(icon, { sx: { color: '#fff' } })}
                </Avatar>
            </Stack>
        </Paper>
    );
}