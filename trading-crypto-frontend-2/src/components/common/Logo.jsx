// src/components/common/Logo.jsx
import React from "react";
import { Box, Typography } from "@mui/material";

export default function Logo({ size = 48, showText = true }) {
  const coinSize = size;
  const fontSize = size * 0.55;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center", // canh giữa theo chiều dọc coin + text
        gap: 1.2,
      }}
    >
      {/* Coin Logo */}
      <Box
        sx={(theme) => ({
          width: coinSize,
          height: coinSize,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 90%)`,
          border: `3px solid ${theme.palette.primary.light}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 10px rgba(59,130,246,0.45)",
        })}
      >
        <Typography
          sx={{
            fontSize: fontSize,
            fontWeight: 900,
            color: "#ffffff",
            textShadow: "0 0 4px rgba(0,0,0,0.4)",
            userSelect: "none",
            lineHeight: 1,
            fontFamily: "Poppins, Inter, sans-serif",
          }}
        >
          B
        </Typography>
      </Box>

      {/* Brand name */}
      {showText && (
        <Typography
          sx={{
            fontSize: size * 0.45,
            fontWeight: 800,
            color: "primary.main",
            letterSpacing: 0.5,
            userSelect: "none",
            lineHeight: 1, // tránh chữ tụt xuống
            fontFamily: "Poppins, Inter, sans-serif",
          }}
        >
          Bitstorm
        </Typography>
      )}
    </Box>
  );
}
