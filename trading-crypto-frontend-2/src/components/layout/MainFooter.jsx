import { Box, Typography } from "@mui/material";

export default function MainFooter() {
  return (
    <Box sx={{ textAlign: "center", py: 3, color: "#94a3b8" }}>
      <Typography variant="caption">
        © {new Date().getFullYear()} BitStorm — Crypto Trading Platform
      </Typography>
    </Box>
  );
}
