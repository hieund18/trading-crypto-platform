import React from "react";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: "flex", bgcolor: "#0f172a", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Nội dung chính */}
      <Box sx={{ flexGrow: 1, ml: { xs: "70px", md: "250px" } }}>
        <AdminHeader />

        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
