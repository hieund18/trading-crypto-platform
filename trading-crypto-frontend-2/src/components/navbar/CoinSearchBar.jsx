// src/components/navbar/CoinSearchBar.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  ClickAwayListener,
  useTheme,
  alpha
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

// API & Utils
import { getMarketsApi } from "../../api/coinApi";
import { formatPrice } from "../../utils/formatters";
// 1. IMPORT COMPONENT HIỂN THỊ PHẦN TRĂM
import PercentChange from "../common/PercentChange"; 

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function CoinSearchBar() {
  const nav = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const INPUT_BG_DARK = "#1C2024"; 
  const INPUT_BG_LIGHT = "#F4F7FA";

  const [keyword, setKeyword] = useState("");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDrop, setOpenDrop] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 300);

  // 2. HÀM FETCH DATA CHUNG (Dùng cho cả search và default list)
  const fetchCoins = async (searchKw) => {
    setLoading(true);
    try {
      // Cấu hình params chuẩn
      const params = {
        page: 1,
        size: 5,            // Luôn lấy 5 kết quả
        isActive: true,     // 🔥 YÊU CẦU 1: Chỉ lấy coin active
        sort: "marketCap,desc" // Mặc định sắp xếp theo vốn hóa (để list default đẹp)
      };

      // Nếu có từ khóa thì thêm vào params
      if (searchKw && searchKw.trim()) {
        params.keyword = searchKw;
      }

      const res = await getMarketsApi(params);
      
      if (res.code === 1000) {
        setCoins(res.result.content || []);
        // Chỉ mở dropdown nếu có kết quả
        if (res.result.content?.length > 0) {
            setOpenDrop(true);
        }
      }
    } catch (err) {
      console.error("Search error", err);
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. EFFECT: Khi người dùng gõ phím (Search)
  useEffect(() => {
    // Nếu keyword rỗng -> không search tự động ở đây (để onFocus lo)
    // Nhưng nếu đang mở mà xóa hết chữ -> load lại top 5
    if (openDrop) {
        fetchCoins(debouncedKeyword);
    }
  }, [debouncedKeyword]);

  // 4. SỰ KIỆN: Khi click vào ô input (Focus)
  const handleFocus = () => {
    setOpenDrop(true);
    // 🔥 YÊU CẦU 2: Hiện ngay 5 coin nếu chưa nhập gì
    if (!keyword) {
        fetchCoins("");
    }
  };

  const handleSelect = (coinId) => {
    nav(`/trade/${coinId}`);
    setOpenDrop(false);
    setKeyword(""); 
  };

  return (
    <ClickAwayListener onClickAway={() => setOpenDrop(false)}>
      <Box sx={{ position: "relative", width: { xs: "100%", sm: 240, md: 280 } }}>
        
        <Paper
          elevation={0}
          sx={{
            px: 1.5,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            borderRadius: "8px",
            bgcolor: isDark ? INPUT_BG_DARK : INPUT_BG_LIGHT,
            border: "1px solid",
            borderColor: "transparent",
            transition: "all 0.2s",
            "&:hover, &:focus-within": {
               borderColor: "primary.main",
               bgcolor: isDark ? alpha(INPUT_BG_DARK, 0.8) : "#fff"
            }
          }}
        >
          <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
          <InputBase
            placeholder="Tìm kiếm coin..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            // Gọi hàm handleFocus khi click vào
            onFocus={handleFocus}
            sx={{ 
                color: "text.primary", 
                width: "100%", 
                fontWeight: 500,
                fontSize: "0.95rem",
                "& input::placeholder": { fontSize: "0.9rem" }
            }}
          />
          {loading && <CircularProgress size={16} sx={{ ml: 1, color: "text.secondary" }} />}
        </Paper>

        {openDrop && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "120%",
              left: 0,
              right: 0,
              zIndex: 1300,
              bgcolor: "background.paper",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              maxHeight: 350, // Tăng chiều cao xíu để chứa nội dung mới
              overflowY: "auto"
            }}
          >
            <List disablePadding>
              {coins.length === 0 && !loading ? (
                 <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                    <Typography variant="body2">Không tìm thấy kết quả</Typography>
                 </Box>
              ) : (
                coins.map((coin) => (
                  <ListItem key={coin.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(coin.id)}
                      sx={{
                        py: 1,
                        "&:hover": { bgcolor: "action.hover" }
                      }}
                    >
                      <Avatar 
                        src={coin.image} 
                        sx={{ width: 32, height: 32, mr: 1.5 }} 
                      />
                      
                      <ListItemText
                        primary={
                            <Typography variant="body2" fontWeight={600}>
                                {coin.symbol.toUpperCase()}
                            </Typography>
                        }
                        secondary={
                            <Typography variant="caption" color="text.secondary">
                                {coin.name}
                            </Typography>
                        }
                      />
                      
                      {/* 🔥 YÊU CẦU 3: Hiện Giá + % Change bên dưới */}
                      <Box textAlign="right">
                          <Typography variant="body2" fontWeight={600} display="block">
                              {formatPrice(coin.currentPrice)}
                          </Typography>
                          
                          <Box display="flex" justifyContent="flex-end">
                            {/* Component PercentChange tự động xử lý màu xanh/đỏ */}
                            <PercentChange 
                                value={coin.priceChangePercentage24h} 
                                sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                            />
                          </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}