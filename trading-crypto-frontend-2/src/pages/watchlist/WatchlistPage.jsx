// src/pages/watchlist/WatchlistPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, Stack, IconButton,
  CircularProgress, Button, Container, Tooltip, Link as MuiLink
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

// Icons
import StarRoundedIcon from "@mui/icons-material/StarRounded"; // Dùng icon ngôi sao
// Đã xóa DeleteOutlineIcon vì không dùng nữa

import MainLayout from "../../components/layout/MainLayout";
import PercentChange from "../../components/common/PercentChange";
import { getMyWatchlistApi, removeFromWatchlistApi } from "../../api/coinApi";
import { useCoinTicker } from "../../hooks/useCoinTicker";
import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

const TEXT_HEAD = "#848e9c";
const COMMON_WEIGHT = 500;

const linkStyle = {
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "100%",
};

export default function WatchlistPage() {
  const nav = useNavigate();
  const { toastSuccess, toastError } = useToast();

  const [initialCoins, setInitialCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load danh sách
  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await getMyWatchlistApi();
      if (res.code === 1000) {
        setInitialCoins(res.result || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // 2. Socket Real-time
  const liveCoins = useCoinTicker(initialCoins);

  // 3. Xử lý xóa (khi bấm vào ngôi sao)
  const handleRemove = async (e, coinId) => {
    e.stopPropagation();
    try {
      const res = await removeFromWatchlistApi(coinId);
      if (res.code === 1000) {
        toastSuccess("Đã xóa khỏi danh sách theo dõi");
        setInitialCoins((prev) => prev.filter((c) => c.id !== coinId));
      } else {
        toastError(res.message || "Xóa thất bại");
      }
    } catch (err) {
      toastError("Lỗi kết nối");
    }
  };

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 4, px: 1 }}>
            <Typography
                variant="h3"
                sx={{
                mb: 1.5,
                color: "text.primary",
                fontFamily: "'Poppins', 'Inter', sans-serif",
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                display: "flex",
                alignItems: "center",
                gap: 1.5
                }}
            >
                <StarRoundedIcon sx={{ color: "#fcd535", fontSize: 32 }} /> 
                Danh sách theo dõi
            </Typography>
            
            {/* 🔥 ĐÃ XÓA DÒNG TEXT CHÚ THÍCH Ở ĐÂY THEO YÊU CẦU */}
        </Box>

        <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
                bgcolor: "transparent", 
                mb: 3, width: "100%", border: "none",
                "& .MuiTableCell-root": { borderBottom: "1px solid rgba(81, 81, 81, 0.1)" },
            }}
        >
          <Table sx={{ minWidth: 900 }} aria-label="watchlist table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }} />
                <TableCell sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>#</TableCell>
                <TableCell sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>Tên</TableCell>
                <TableCell align="right" sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>Giá</TableCell>
                <TableCell align="right" sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>Thay đổi (24h)</TableCell>
                <TableCell align="right" sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>Khối lượng (24h)</TableCell>
                <TableCell align="right" sx={{ color: TEXT_HEAD, fontWeight: 600, fontSize: 13 }}>Vốn hóa thị trường</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10, borderBottom: "none" }}><CircularProgress /></TableCell></TableRow>
              ) : liveCoins.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10, borderBottom: "none" }}>
                        <Typography color="text.secondary">Danh sách trống.</Typography>
                        <Button variant="outlined" onClick={() => nav("/markets")} sx={{ mt: 2 }}>
                            Khám phá thị trường
                        </Button>
                    </TableCell>
                </TableRow>
              ) : (
                liveCoins.map((coin, index) => (
                  <TableRow
                    key={coin.id}
                    hover
                    onClick={() => nav(`/trade/${coin.id}`)}
                    sx={{
                      cursor: "pointer",
                      textDecoration: "none",
                      "&:hover": { bgcolor: "action.hover" },
                      height: 60,
                      "& .MuiTableCell-root": { color: "inherit" },
                    }}
                  >
                    {/* 🔥 SỬA: Đổi thùng rác thành Ngôi sao vàng */}
                    <TableCell sx={{ padding: "0 0 0 16px" }}>
                        <Tooltip title="Xóa khỏi danh sách theo dõi" arrow placement="top">
                            <IconButton 
                                onClick={(e) => handleRemove(e, coin.id)} 
                                size="small"
                            >
                                <StarRoundedIcon sx={{ color: "#fcd535" }} />
                            </IconButton>
                        </Tooltip>
                    </TableCell>

                    <TableCell sx={{ color: TEXT_HEAD }}>{index + 1}</TableCell>

                    <TableCell component="th" scope="row">
                        <Link to={`/trade/${coin.id}`} style={linkStyle}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={coin.image} alt={coin.name} sx={{ width: 28, height: 28 }} />
                            <Stack direction="row" alignItems="baseline" spacing={0.8}>
                                <Typography fontSize="0.95rem" fontWeight={COMMON_WEIGHT} color="text.primary">
                                {coin.symbol?.toUpperCase()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={400}>
                                {coin.name}
                                </Typography>
                            </Stack>
                            </Stack>
                        </Link>
                    </TableCell>

                    <TableCell align="right" sx={{ fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }}>
                        <Link to={`/trade/${coin.id}`} style={{ ...linkStyle, justifyContent: "flex-end" }}>
                            {formatPrice(coin.currentPrice)}
                        </Link>
                    </TableCell>

                    <TableCell align="right">
                        <PercentChange 
                            value={coin.priceChangePercentage24h} 
                            sx={{ justifyContent: "flex-end", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }} 
                        />
                    </TableCell>

                    <TableCell align="right" sx={{ color: "text.primary", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }}>
                        {formatCompactCurrency(coin.totalVolume)}
                    </TableCell>
                    
                    <TableCell align="right" sx={{ color: "text.primary", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }}>
                        {formatCompactCurrency(coin.marketCap)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </MainLayout>
  );
}