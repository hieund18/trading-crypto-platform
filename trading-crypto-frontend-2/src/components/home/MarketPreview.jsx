import React from "react";
import { Paper, Box, Typography, Stack } from "@mui/material";

const sample = [
  { symbol: "BTC/USDT", price: "95,120", change: "+1.52%" },
  { symbol: "ETH/USDT", price: "3,120", change: "-0.35%" },
  { symbol: "BNB/USDT", price: "520", change: "+0.80%" },
];

export default function MarketPreview() {
  return (
    <Box>
      <Typography variant="h5" color="text.primary" fontWeight={700} mb={2}>
        Thị trường phổ biến
      </Typography>

      <Stack spacing={2}>
        {sample.map((c, i) => (
          <Paper
            key={i}
            sx={{
              bgcolor: "background.paper",
              p: 2,
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              border: "1px solid", // <-- SỬA
              borderColor: "divider", // <-- SỬA
            }}
          >
            <Typography color="text.primary">{c.symbol}</Typography>
            <Typography fontWeight={700} color="text.primary">
              {c.price}
            </Typography>
            <Typography
              fontWeight={700}
              color={c.change.startsWith("+") ? "#3b82f6" : "#ef4444"}
            >
              {c.change}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
