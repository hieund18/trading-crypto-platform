// src/pages/leaderboard/LeaderboardPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, Grid, Paper, Tabs, Tab, 
  Avatar, Stack, CircularProgress, Divider, Chip, Skeleton, useTheme
} from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import { getTopUsersVolumeApi, getTopCoinsVolumeApi } from "../../api/orderApi";
import { getPublicProfilesApi } from "../../api/profileApi";
import { getCoinDetailApi } from "../../api/coinApi";
import { formatCompactCurrency } from "../../utils/formatters";

// Helpers
const getTimeRangeParams = (range) => {
    const toDate = new Date();
    const fromDate = new Date();
    toDate.setHours(23, 59, 59, 999);

    if (range === "1D") fromDate.setHours(0, 0, 0, 0);
    else if (range === "7D") fromDate.setDate(toDate.getDate() - 7);
    else if (range === "30D") fromDate.setDate(toDate.getDate() - 30);
    else if (range === "1Y") fromDate.setFullYear(toDate.getFullYear() - 1);

    return { from: fromDate.toISOString(), to: toDate.toISOString() };
};

const fillTo10 = (arr) => {
    const filled = [...arr];
    while (filled.length < 10) filled.push(null);
    return filled;
};

export default function LeaderboardPage() {
  const nav = useNavigate();
  const [timeRange, setTimeRange] = useState("7D");
  const [topUsers, setTopUsers] = useState([]);
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setTopUsers([]);
        setTopCoins([]);
        
        try {
            const params = getTimeRangeParams(timeRange);
            const [usersRes, coinsRes] = await Promise.all([
                getTopUsersVolumeApi(params),
                getTopCoinsVolumeApi(params)
            ]);

            // Xử lý Users
            let enrichedUsers = [];
            if (usersRes.code === 1000 && usersRes.result.length > 0) {
                const userIds = usersRes.result.map(u => u.userId).join(",");
                const profilesRes = await getPublicProfilesApi(userIds);
                const profilesMap = {};
                if (profilesRes.code === 1000 && Array.isArray(profilesRes.result)) {
                    profilesRes.result.forEach(p => profilesMap[p.userId] = p);
                }
                enrichedUsers = usersRes.result.map(u => ({
                    ...u,
                    profile: profilesMap[u.userId] || { fullName: "Unknown User", avatar: null }
                })).slice(0, 10);
            }
            setTopUsers(enrichedUsers);

            // Xử lý Coins
            let enrichedCoins = [];
            if (coinsRes.code === 1000 && coinsRes.result.length > 0) {
                const coinPromises = coinsRes.result.slice(0, 10).map(async (c) => {
                    try {
                        const detailRes = await getCoinDetailApi(c.coinId);
                        return {
                            ...c,
                            info: detailRes.code === 1000 ? detailRes.result : { name: c.coinId, symbol: "", image: "" }
                        };
                    } catch (e) { return { ...c, info: { name: c.coinId } }; }
                });
                enrichedCoins = await Promise.all(coinPromises);
            }
            setTopCoins(enrichedCoins);

        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, [timeRange]);

  const MedalIcon = ({ rank }) => {
      if (rank === 1) return <Typography fontSize="1.5rem">🥇</Typography>;
      if (rank === 2) return <Typography fontSize="1.5rem">🥈</Typography>;
      if (rank === 3) return <Typography fontSize="1.5rem">🥉</Typography>;
      return <Typography fontWeight={700} color="text.secondary" sx={{ width: 24, textAlign: 'center' }}>{rank}</Typography>;
  };

  const RowItem = ({ rank, image, title, subtitle, value, isCoin, onClick }) => (
      <Box 
          onClick={onClick} 
          sx={{ 
              p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid', borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
              transition: '0.2s', 
              '&:hover': { bgcolor: 'action.hover' },
              height: 64,
              cursor: onClick ? 'pointer' : 'default' 
          }}
      >
          <Stack direction="row" alignItems="center" gap={2}>
              <Box width={30} display="flex" justifyContent="center">
                  <MedalIcon rank={rank} />
              </Box>
              <Avatar src={image} sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider' }}>
                  {title?.charAt(0)}
              </Avatar>
              <Box>
                  {isCoin ? (
                      <>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                            {title?.toUpperCase()} 
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {subtitle} 
                        </Typography>
                      </>
                  ) : (
                      <>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                      </>
                  )}
              </Box>
          </Stack>
          
          <Typography variant="body2" fontWeight={700} color="text.primary">
              {value}
          </Typography>
      </Box>
  );

  const EmptyRow = ({ rank }) => (
      <Box 
          sx={{ 
              p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid', borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
              height: 64
          }}
      >
          <Stack direction="row" alignItems="center" gap={2}>
              <Box width={30} display="flex" justifyContent="center">
                  <Typography color="text.disabled" fontWeight={500}>{rank}</Typography>
              </Box>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}> </Avatar>
              <Box>
                  <Typography variant="body2" color="text.disabled">---</Typography>
              </Box>
          </Stack>
          <Typography variant="body2" color="text.disabled">---</Typography>
      </Box>
  );

  const paperSx = { 
      p: 0, borderRadius: 3, overflow: 'hidden', 
      border: '1px solid', borderColor: 'divider', 
      height: '100%',
      bgcolor: "transparent"
  };

  return (
    <MainLayout maxWidth={1200}>
      {/* 🔥 1. GIẢM Padding-Y ĐỂ ĐẨY TRANG LÊN CAO */}
      <Container disableGutters sx={{ py: 2 }}> 
        
        {/* HEADER */}
        {/* 🔥 2. GIẢM Margin-Bottom */}
        <Box textAlign="center" mb={4}> 
            {/* 🔥 3. CHỈNH FONT TIÊU ĐỀ: Dùng h5, font chuẩn */}
            <Typography variant="h5" fontWeight={700} color="text.primary">
                Bảng Xếp Hạng
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
                Top nhà đầu tư và đồng coin có khối lượng giao dịch lớn nhất
            </Typography>

            <Box mt={3} display="flex" justifyContent="center">
                <Tabs 
                    value={timeRange} 
                    onChange={(e, v) => setTimeRange(v)}
                    centered
                    sx={{ 
                        bgcolor: 'transparent',
                        borderRadius: 3, p: 0.5, 
                        border: '1px solid', borderColor: 'divider',
                        '& .MuiTab-root': { minHeight: 40, borderRadius: 2, zIndex: 1, textTransform: 'none', fontWeight: 600 },
                        '& .MuiTabs-indicator': { height: '100%', borderRadius: 2, bgcolor: 'action.selected' }
                    }}
                >
                    <Tab label="24H" value="1D" />
                    <Tab label="7 Ngày" value="7D" />
                    <Tab label="30 Ngày" value="30D" />
                    <Tab label="1 Năm" value="1Y" />
                </Tabs>
            </Box>
        </Box>

        <Grid container spacing={4}>
            
            {/* CỘT TRÁI: TOP USERS */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={paperSx}>
                    <Box p={3} borderBottom="1px solid" borderColor="divider">
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            {/* 🔥 4. ĐỔI MÀU ICON USER THÀNH XANH */}
                            <Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}><EmojiEventsIcon /></Avatar>
                            <Typography variant="h6" fontWeight={700}>Top Nhà Đầu Tư</Typography>
                        </Stack>
                    </Box>
                    
                    {fillTo10(topUsers).map((user, index) => {
                        const rank = index + 1;
                        if (!user) return <EmptyRow key={index} rank={rank} />;
                        
                        return (
                            <RowItem 
                                key={user.userId}
                                rank={rank}
                                image={user.profile?.avatar}
                                title={user.profile?.fullName || "User"}
                                subtitle={`${user.transactionCount} giao dịch`}
                                value={formatCompactCurrency(user.totalVolume)}
                                isCoin={false} 
                            />
                        );
                    })}
                </Paper>
            </Grid>

            {/* CỘT PHẢI: TOP COINS */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={paperSx}>
                    <Box p={3} borderBottom="1px solid" borderColor="divider">
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}><MonetizationOnIcon /></Avatar>
                            <Typography variant="h6" fontWeight={700}>Top Coin Giao Dịch</Typography>
                        </Stack>
                    </Box>

                    {fillTo10(topCoins).map((coin, index) => {
                        const rank = index + 1;
                        if (!coin) return <EmptyRow key={index} rank={rank} />;

                        return (
                            <RowItem 
                                key={coin.coinId}
                                rank={rank}
                                image={coin.info?.image}
                                title={coin.info?.symbol || coin.coinId} 
                                subtitle={coin.info?.name} 
                                value={formatCompactCurrency(coin.totalVolume)}
                                isCoin={true} 
                                onClick={() => nav(`/trade/${coin.coinId}`)} 
                            />
                        );
                    })}
                </Paper>
            </Grid>

        </Grid>
      </Container>
    </MainLayout>
  );
}