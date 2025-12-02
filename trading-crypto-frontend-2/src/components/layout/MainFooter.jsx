import { Box, Typography } from "@mui/material";

export default function MainFooter() {
  return (
    <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}> 
      <Typography variant="caption">
        © {new Date().getFullYear()} Bitstorm — Crypto Trading Platform
      </Typography>
    </Box>
  );
}
