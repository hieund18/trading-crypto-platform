import React, { useState, useEffect } from "react";
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Debounce helper
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function CoinSearchBar() {
  const nav = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [coins, setCoins] = useState([]);
  const [openDrop, setOpenDrop] = useState(false);

  // API search coin
  const searchCoins = async (kw) => {
    if (!kw.trim()) {
      setCoins([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8888/api/v1/coin/markets/search?keyword=${kw}`
      );
      setCoins(res.data?.result?.items || []);
      setOpenDrop(true);
    } catch (err) {
      setCoins([]);
    }
  };

  const debouncedSearch = debounce(searchCoins, 300);

  const handleChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    debouncedSearch(val);
  };

  const handleSelect = (coinId) => {
    nav(`/trade/${coinId}`);
    setOpenDrop(false);
    setKeyword("");
  };

  return (
    <Box sx={{ position: "relative", width: 260 }}>
      <Paper
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          background: "#0f172a",
          border: "1px solid #334155",
        }}
      >
        <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} />
        <InputBase
          placeholder="Tìm coin..."
          value={keyword}
          onChange={handleChange}
          onFocus={() => keyword && setOpenDrop(true)}
          sx={{ color: "white", width: "100%" }}
        />
      </Paper>

      {openDrop && coins.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            top: 45,
            width: "100%",
            zIndex: 99,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          <List>
            {coins.map((coin) => (
              <ListItem
                key={coin.id}
                button
                onClick={() => handleSelect(coin.id)}
                sx={{
                  "&:hover": { background: "#334155" },
                }}
              >
                <ListItemText
                  primary={coin.symbol.toUpperCase()}
                  secondary={coin.name}
                  primaryTypographyProps={{ color: "white", fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "#94a3b8" }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
