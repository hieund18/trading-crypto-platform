// src/pages/markets/MarketPage.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Pagination,
  IconButton,
  LinearProgress,
  Fade,
  Tooltip,
} from "@mui/material";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

// Icons
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

import MainLayout from "../../components/layout/MainLayout";
import { getMarketsApi, getTrendingApi } from "../../api/coinApi";
import { useCoinTicker } from "../../hooks/useCoinTicker";
import MarketTabs from "./MarketTabs";
import MarketSearchBar from "./MarketSearchBar";
import MarketSortMenu from "./MarketSortMenu";

// 1. IMPORT CÁC COMPONENT & UTILS DÙNG CHUNG
import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import PercentChange from "../../components/common/PercentChange";

import { addToWatchlistApi, removeFromWatchlistApi, getMyWatchlistApi } from "../../api/coinApi";
import { useToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// XÓA: const COLOR_UP...
// XÓA: const COLOR_DOWN...
const TEXT_HEAD = "#848e9c";
const COMMON_WEIGHT = 500;

const TAB_CONTENT = {
  0: {
    title: "Tổng quan thị trường",
    desc: "Theo dõi biến động giá, khối lượng giao dịch và vốn hóa của hàng trăm đồng tiền kỹ thuật số hàng đầu thế giới.",
  },
  1: {
    title: "Tăng trưởng mạnh nhất",
    desc: "Danh sách các đồng coin có hiệu suất tăng giá vượt trội, dẫn đầu xu hướng thị trường trong 24 giờ qua.",
  },
  2: {
    title: "Giảm giá mạnh nhất",
    desc: "Cập nhật các đồng coin đang có nhịp điều chỉnh giá mạnh, cơ hội tiềm năng cho các chiến lược bắt đáy.",
  },
  3: {
    title: "Xu hướng tìm kiếm",
    desc: "Những dự án đang nhận được sự quan tâm lớn nhất từ cộng đồng đầu tư và có lượt tìm kiếm tăng đột biến.",
  },
};

// XÓA: const formatPrice...
// XÓA: const formatCompactCurrency...
// XÓA: const PercentChange... (Vì đã import)

const linkStyle = {
  textDecoration: "none",
  color: "inherit",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "100%",
};

export default function MarketPage() {
  useDocumentTitle("Thị trường Crypto");

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const tab = parseInt(searchParams.get("tab") || "0");

  const [apiCoins, setApiCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState(null);
  const [pageSize, setPageSize] = useState(30);

  const { user } = useAuth(); // Lấy user để biết đã login chưa
  const { toastSuccess, toastError, toastWarning } = useToast();

  const nav = useNavigate();

  // 1. Load danh sách yêu thích khi vào trang
  useEffect(() => {
    if (user) {
      getMyWatchlistApi()
        .then((res) => {
          if (res.code === 1000) {
            // Chuyển array thành object { "bitcoin": true, "eth": true }
            const favMap = {};
            res.result.forEach((c) => (favMap[c.id] = true));
            setFavorites(favMap);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setSortValue(null);
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMarkets(page, tab, searchQuery, sortValue, pageSize);
    }, 500);
    return () => clearTimeout(timer);
  }, [page, tab, searchQuery, sortValue, pageSize]);

  const fetchMarkets = async (pageNumber, currentTab, keyword, currentSort, currentSize) => {
    try {
      setLoading(true);
      let res;
      if (currentTab === 3) {
        res = await getTrendingApi({ page: pageNumber, size: currentSize });
      } else {
        let sortParam = "marketCap,desc";
        if (currentSort) sortParam = currentSort;
        else {
          if (currentTab === 1) sortParam = "priceChangePercentage24h,desc";
          if (currentTab === 2) sortParam = "priceChangePercentage24h,asc";
        }
        res = await getMarketsApi({
          page: pageNumber,
          size: currentSize,
          sort: sortParam,
          isActive: true,
          keyword: keyword,
        });
      }
      if (res && res.code === 1000) {
        setApiCoins(res.result.content);
        setTotalPages(res.result.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const liveCoins = useCoinTicker(apiCoins);

  const handlePageChange = (event, value) => {
    setSearchParams({ tab: tab, page: value });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue, page: 1 });
    setSearchQuery("");
  };

  const handleSortChange = (newSortValue) => {
    setSortValue(newSortValue);
    setSearchParams({ tab: tab, page: 1 });
  };

  const handleSizeChange = (newSize) => {
    setPageSize(newSize);
    setSearchParams({ tab: tab, page: 1 });
  };

  const toggleFavorite = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toastWarning("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    const isFav = favorites[id];

    // Optimistic UI update (Cập nhật giao diện trước cho mượt)
    setFavorites((prev) => ({ ...prev, [id]: !isFav }));

    try {
      if (isFav) {
        // Đang thích -> Bấm để xóa
        await removeFromWatchlistApi(id);
        toastSuccess("Đã xóa khỏi Watchlist");
      } else {
        // Chưa thích -> Bấm để thêm
        await addToWatchlistApi(id);
        toastSuccess("Đã thêm vào Watchlist");
      }
    } catch (err) {
      // Nếu lỗi thì revert lại UI
      setFavorites((prev) => ({ ...prev, [id]: isFav }));
      toastError("Lỗi kết nối!");
    }
  };

  return (
    <MainLayout maxWidth={1300}>
      <Box sx={{ mt: 3, mb: 4 }}>
        <MarketTabs tab={tab} onChange={handleTabChange} />
      </Box>

      <Fade in={true} key={tab} timeout={500}>
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
              display: "inline-block",
            }}
          >
            {TAB_CONTENT[tab]?.title || "Thị trường"}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 700,
              color: "text.secondary",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            {TAB_CONTENT[tab]?.desc}
          </Typography>
        </Box>
      </Fade>

      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mb: 2, px: 1 }}>
        <MarketSearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <MarketSortMenu
          currentSort={sortValue}
          onSortChange={handleSortChange}
          currentSize={pageSize}
          onSizeChange={handleSizeChange}
        />
      </Stack>

      <Box sx={{ width: "100%", height: 4 }}>
        {loading && <LinearProgress sx={{ bgcolor: "transparent" }} />}
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          bgcolor: "transparent",
          mb: 3,
          width: "100%",
          border: "none",
          opacity: loading ? 0.85 : 1,
          transition: "opacity 0.2s",
          pointerEvents: loading ? "none" : "auto",
          "& .MuiTableCell-root": {
            borderBottom: "1px solid rgba(81, 81, 81, 0.1)",
          },
        }}
      >
        <Table sx={{ minWidth: 900 }} aria-label="market table">
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
            {liveCoins.map((coin, index) => (
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
                <TableCell sx={{ padding: "0 0 0 16px" }}>
                  {/* 2. Bọc IconButton bằng Tooltip */}
                  <Tooltip 
                    title={favorites[coin.id] ? "Xóa khỏi danh sách theo dõi" : "Thêm vào danh sách theo dõi"} 
                    arrow
                    placement="top"
                  >
                    <IconButton onClick={(e) => toggleFavorite(e, coin.id)} size="small">
                      {favorites[coin.id] ? (
                        <StarRoundedIcon sx={{ color: "#fcd535" }} />
                      ) : (
                        <StarBorderRoundedIcon sx={{ color: "#b7bdc6" }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <TableCell sx={{ color: TEXT_HEAD }}>{(page - 1) * 30 + index + 1}</TableCell>

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

                {/* DÙNG SHARED COMPONENT: Tự động dùng màu từ Theme */}
                <TableCell align="right">
                  <PercentChange 
                    value={coin.priceChangePercentage24h} 
                    sx={{ justifyContent: "flex-end", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }} // Căn phải cho Table
                  />
                </TableCell>

                <TableCell align="right" sx={{ color: "text.primary", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }}>
                  {formatCompactCurrency(coin.totalVolume)}
                </TableCell>

                <TableCell align="right" sx={{ color: "text.primary", fontWeight: COMMON_WEIGHT, fontSize: "0.95rem" }}>
                  {formatCompactCurrency(coin.marketCap)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", pb: 8 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          shape="rounded"
        />
      </Box>
    </MainLayout>
  );
}