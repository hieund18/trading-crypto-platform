// src/components/admin/AdminLayout.jsx
import React from "react";
import { Box } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import MainFooter from "../layout/MainFooter"; 

export default function AdminLayout({ children }) {
  const SIDEBAR_WIDTH = 260; 

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default" // Màu nền chính cho toàn bộ layout
      }}
    >
      
      {/* 1. Header */}
      <Box sx={{ zIndex: 1201, position: "relative" }}>
        <AdminHeader />
      </Box>

      {/* 2. Body (Sidebar + Content) */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        
        <AdminSidebar width={SIDEBAR_WIDTH} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
            display: "flex",
            flexDirection: "column"
          }}
        >
          {children}
        </Box>
      </Box>

      {/* 3. Footer */}
      {/* 🔥 SỬA: Dùng background.default và bỏ borderTop */}
      <Box sx={{ bgcolor: "background.default" }}>
         <MainFooter />
      </Box>

    </Box>
  );
}