// src/components/auth/AuthLayout.jsx
import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import Logo from "../common/Logo";

export default function AuthLayout({ title, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#181a20",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: 400,
          bgcolor: "#1e2329",
          border: "1px solid #2b3139",
          borderRadius: 2,
        }}
      >
        {/* Header: Logo + Title */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center", // căn giữa cả Logo + title
            gap: 1,
          }}
        >
          {/* Logo + BitStorm nằm cạnh nhau */}
          <Logo size={40} showText />

          {/* Title form (Đăng nhập / Đăng ký) */}
          <Typography variant="h5" fontWeight={700} color="white">
            {title}
          </Typography>
        </Box>

        {children}

        <Typography
          color="text.secondary"
          variant="caption"
          display="block"
          textAlign="center"
          mt={3}
        >
          © {new Date().getFullYear()} Bitstorm
        </Typography>
      </Paper>
    </Box>
  );
}
