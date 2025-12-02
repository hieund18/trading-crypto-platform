// src/pages/markets/MarketSearchBar.jsx
import React from "react";
import { Paper, InputBase, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function MarketSearchBar({ value, onChange }) {
  return (
    <Box sx={{ width: { xs: "100%", sm: 280 } }}>
      <Paper
        elevation={0} // Bỏ bóng để giống style flat
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          // Style giống hệt CoinSearchBar
          bgcolor: "background.default", // Hoặc "action.hover" tùy theme bạn muốn
          border: "1px solid",
          borderColor: "divider",
          "&:hover": {
            borderColor: "primary.main", // Hiệu ứng hover giống navbar
          },
          transition: "all 0.2s"
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
        <InputBase
          placeholder="Tìm kiếm đồng coin..."
          value={value}
          onChange={onChange}
          sx={{ 
            color: "text.primary", 
            width: "100%", 
            fontWeight: 500,
            fontSize: "0.95rem"
          }}
        />
      </Paper>
    </Box>
  );
}