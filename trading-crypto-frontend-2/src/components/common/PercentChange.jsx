// src/components/common/PercentChange.jsx
import React from "react";
import { Stack, Typography, useTheme } from "@mui/material"; // Import useTheme
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function PercentChange({ value, sx = {} }) {
  const theme = useTheme(); // Lấy theme
  
  // Fallback nếu value null
  if (value === undefined || value === null) return <Typography>0.00%</Typography>;
  
  const isUp = value >= 0;
  // Lấy màu từ theme đã cài đặt ở Bước 1
  const color = isUp ? theme.palette.trade.up : theme.palette.trade.down;

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        color: color, // Áp dụng màu
        fontWeight: 600,
        fontSize: "0.95rem",
        ...sx 
      }}
    >
      {isUp ? (
        <ArrowDropUpIcon fontSize="small" />
      ) : (
        <ArrowDropDownIcon fontSize="small" />
      )}
      {Math.abs(value).toFixed(2)}%
    </Stack>
  );
}