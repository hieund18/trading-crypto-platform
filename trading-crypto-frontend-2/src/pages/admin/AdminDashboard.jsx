// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress, useTheme } from "@mui/material";
import AdminLayout from "../../components/admin/AdminLayout";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaidIcon from '@mui/icons-material/Paid';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Mock data
  const stats = {
      totalUsers: 1250,
      totalVolume: 540200,
      activeCoins: 12,
      pendingWithdrawals: 5
  };

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  if (loading) return <AdminLayout><Box p={5} textAlign="center"><CircularProgress /></Box></AdminLayout>;

  return (
    <AdminLayout>
      <Typography variant="h5" fontWeight={700} mb={3}>Tổng quan hệ thống</Typography>
      <Grid container spacing={3}>
        <StatCard title="Tổng người dùng" value={stats.totalUsers} icon={<PeopleAltIcon fontSize="large"/>} color={theme.palette.primary.main} />
        <StatCard title="Volume Giao dịch" value={`$${stats.totalVolume.toLocaleString()}`} icon={<PaidIcon fontSize="large"/>} color="#16c784" />
        <StatCard title="Coin đang hoạt động" value={stats.activeCoins} icon={<CurrencyBitcoinIcon fontSize="large"/>} color="#f59e0b" />
        <StatCard title="Rút tiền chờ duyệt" value={stats.pendingWithdrawals} icon={<PaidIcon fontSize="large"/>} color="#ea3943" />
      </Grid>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          // 🔥 Style theo theme
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          height: "100%",
          position: 'relative',
          overflow: 'hidden',
          "&::before": {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: 4,
              bgcolor: color
          }
        }}
      >
        <Box>
           <Typography color="text.secondary" variant="body2" fontWeight={600} mb={0.5}>{title}</Typography>
           <Typography variant="h4" fontWeight={700} color="text.primary">{value}</Typography>
        </Box>
        <Box sx={{ color: color, opacity: 0.9, bgcolor: 'action.hover', p: 1.5, borderRadius: '50%' }}>{icon}</Box>
      </Paper>
    </Grid>
  );
}