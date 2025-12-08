// src/components/home/MarketPreview.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Avatar, Stack, Skeleton, Button, Container } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from "react-router-dom";

import { getMarketsApi } from "../../api/coinApi";
import { formatPrice } from "../../utils/formatters";

export default function MarketPreview() {
  const nav = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCoins = async () => {
        try {
            // 🔥 Thêm isActive: true để chỉ lấy coin đang hoạt động
            const res = await getMarketsApi({ 
                page: 1, 
                size: 4, 
                sort: "marketCap,desc",
                isActive: true 
            });
            
            if (res.code === 1000) {
                setCoins(res.result.content || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchTopCoins();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={3}>
            <Box>
                <Typography variant="h4" fontWeight={700} mb={1}>Thị trường nổi bật</Typography>
                <Typography variant="body1" color="text.secondary">Những đồng coin đang dẫn đầu xu hướng hôm nay</Typography>
            </Box>
            <Button endIcon={<ArrowForwardIcon />} onClick={() => nav('/markets')}>Xem tất cả</Button>
        </Box>

        {/* 🔥 Sửa Grid2 thành Grid */}
        <Grid container spacing={3}>
            {loading ? (
                [1, 2, 3, 4].map(i => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
                        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))
            ) : (
                coins.map((coin) => {
                    const isUp = coin.priceChangePercentage24h >= 0;
                    return (
                        <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={coin.id}>
                            <Paper 
                                elevation={0}
                                onClick={() => nav(`/trade/${coin.id}`)}
                                sx={{ 
                                    p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider',
                                    transition: 'all 0.3s', cursor: 'pointer',
                                    '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" mb={2}>
                                    <Stack direction="row" alignItems="center" gap={1.5}>
                                        <Avatar src={coin.image} sx={{ width: 32, height: 32 }} />
                                        <Typography fontWeight={700}>{coin.symbol.toUpperCase()}</Typography>
                                    </Stack>
                                    <Box 
                                        sx={{ 
                                            bgcolor: isUp ? 'rgba(22, 199, 132, 0.1)' : 'rgba(234, 57, 67, 0.1)',
                                            color: isUp ? '#16c784' : '#ea3943',
                                            px: 1, py: 0.5, borderRadius: 1, fontWeight: 700, fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: 0.5
                                        }}
                                    >
                                        {isUp ? <TrendingUpIcon sx={{ fontSize: 16 }}/> : <TrendingDownIcon sx={{ fontSize: 16 }}/>}
                                        {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                                    </Box>
                                </Stack>
                                
                                <Typography variant="h5" fontWeight={700}>
                                    {formatPrice(coin.currentPrice)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Vol: {coin.totalVolume.toLocaleString()}</Typography>
                            </Paper>
                        </Grid>
                    )
                })
            )}
        </Grid>
    </Container>
  );
}