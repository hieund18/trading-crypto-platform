import React from "react";
import { Box } from "@mui/material";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";

export default function MainLayout({ children }) {
  return (
    <Box sx={{ bgcolor: "#0f172a", minHeight: "100vh" }}>
      <MainNavbar />

      <Box sx={{ px: 3, py: 3, maxWidth: 1400, mx: "auto" }}>
        {children}
      </Box>

      <MainFooter />
    </Box>
  );
}
