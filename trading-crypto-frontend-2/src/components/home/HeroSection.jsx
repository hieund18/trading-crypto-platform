import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        color: "text.primary",
      }}
    >
      <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
        BitStorm — Giao dịch Crypto đơn giản & an toàn
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Nơi bạn có thể mua bán coin nhanh chóng, bảo mật tuyệt đối.
      </Typography>

      <Button
        href="/register"
        size="large"
        variant="contained"
        color="primary"
        sx={{}}
      >
        Bắt đầu ngay
      </Button>
    </Box>
  );
}
