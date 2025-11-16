import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        color: "white",
      }}
    >
      <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
        BitStorm — Giao dịch Crypto đơn giản & an toàn
      </Typography>

      <Typography variant="h6" color="#94a3b8" sx={{ mb: 4 }}>
        Nơi bạn có thể mua bán coin nhanh chóng, bảo mật tuyệt đối.
      </Typography>

      <Button
        href="/register"
        size="large"
        variant="contained"
        sx={{ bgcolor: "#3b82f6" }}
      >
        Bắt đầu ngay
      </Button>
    </Box>
  );
}
