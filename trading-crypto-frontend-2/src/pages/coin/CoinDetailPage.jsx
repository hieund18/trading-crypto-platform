// src/pages/coin/CoinDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Grid,
  // Paper, // <-- Không cần dùng Paper nữa
  Container,
} from "@mui/material";

import MainLayout from "../../components/layout/MainLayout";
import CoinChart from "../../components/coin/CoinChart";
import TradeForm from "../../components/coin/TradeForm";
import { getCoinDetailApi } from "../../api/coinApi";
import { useSingleCoinTicker } from "../../hooks/useSingleCoinTicker";

// 1. IMPORT CÁC UTILS/COMPONENTS DÙNG CHUNG
import { formatPrice } from "../../utils/formatters";
import PercentChange from "../../components/common/PercentChange";

export default function CoinDetailPage() {
  const { id } = useParams();
  const [initialCoin, setInitialCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCoin = async () => {
      setLoading(true);
      setErrorMsg("");
      setInitialCoin(null);
      try {
        const res = await getCoinDetailApi(id);
        if (res.code === 1000) {
          setInitialCoin(res.result);
        } else {
          setErrorMsg(res.message || "Không tìm thấy thông tin Coin này.");
        }
      } catch (error) {
        console.error("Failed to load coin", error);
        setErrorMsg("Đã có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCoin();
  }, [id]);

  const coin = useSingleCoinTicker(initialCoin);

  if (loading)
    return (
      <MainLayout>
        <CircularProgress sx={{ m: 5 }} />
      </MainLayout>
    );
  if (errorMsg || !coin)
    return (
      <MainLayout>
        <Typography sx={{ m: 5 }}>Error</Typography>
      </MainLayout>
    );

  const symbolUpper = coin.symbol?.toUpperCase();

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* HEADER: TÊN & GIÁ */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar src={coin.image} sx={{ width: 56, height: 56 }} />
          <Box>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
              <Typography variant="body1" color="text.primary" fontWeight={600}>
                Giá {coin.name} ({symbolUpper})
              </Typography>
              <Chip
                label={`#${coin.marketCapRank}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "11px",
                  fontWeight: 600,
                  bgcolor: "action.hover",
                  color: "text.secondary",
                  borderRadius: "4px",
                }}
              />
            </Stack>

            <Stack direction="row" alignItems="center" gap={2}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="text.primary"
                sx={{ lineHeight: 1 }}
              >
                {formatPrice(coin.currentPrice)}
              </Typography>

              {/* 2. SỬ DỤNG COMPONENT PERCENT CHANGE */}
              <PercentChange
                value={coin.priceChangePercentage24h}
                sx={{ fontSize: "1.2rem", fontWeight: 700 }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* --- KHU VỰC CHART & TRADE --- */}
        {/* Mình chỉnh lại spacing=4 cho cân đối hơn (12 hơi xa) */}
        <Grid container spacing={4} sx={{ mt: 4, mb: 3 }}>
          {/* GIỮ NGUYÊN CẤU TRÚC 'size' NHƯ BẠN YÊU CẦU */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <CoinChart coinId={coin.id} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <TradeForm
              coinId={coin.id} // <-- Quan trọng: để gọi API convert
              symbol={coin.symbol}
              currentPrice={coin.currentPrice}
            />
          </Grid>
        </Grid>

        {/* 3. THÔNG TIN CHI TIẾT (Đã bỏ Paper, dùng Box trong suốt) */}
        <Box
          sx={{
            p: 0,
            border: "none",
            bgcolor: "transparent",
            mt: 4,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Thống kê thị trường {coin.name}
          </Typography>

          <Grid container spacing={4}>
            {/* GIỮ NGUYÊN CẤU TRÚC 'size' */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoRow
                label="Vốn hóa thị trường"
                value={`$${coin.marketCap?.toLocaleString()}`}
              />

              {/* 4. ĐỔI THÀNH TỔNG CUNG */}
              <InfoRow
                label="Khối lượng giao dịch 24h"
                value={`$${coin.totalVolume?.toLocaleString()}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoRow label="Cao nhất 24h" value={formatPrice(coin.high24h)} />
              <InfoRow label="Thấp nhất 24h" value={formatPrice(coin.low24h)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoRow label="Cao nhất lịch sử" value={formatPrice(coin.ath)} />
              <InfoRow
                label="Thấp nhất lịch sử"
                value={formatPrice(coin.atl)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoRow
                label="Tổng cung"
                value={
                  coin.totalSupply
                    ? `${coin.totalSupply.toLocaleString()} ${symbolUpper}`
                    : "N/A"
                }
              />
              <InfoRow
                label="Lưu hành"
                value={`${coin.circulatingSupply?.toLocaleString()} ${symbolUpper}`}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </MainLayout>
  );
}

// Component con hiển thị dòng thông tin (Style nhẹ lại border bottom)
function InfoRow({ label, value }) {
  return (
    <Box
      mb={2}
      sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 1 }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mb={0.5}
      >
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}
