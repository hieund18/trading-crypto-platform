// src/components/admin/AdminSidebar.jsx
import React from "react";
import { 
  Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, 
  useTheme 
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';

// 🔥 GỘP MENU THÀNH 1 NHÓM DUY NHẤT
const menuItems = [
  { 
    section: "Main",
    items: [
      { label: "Tổng quan", path: "/admin", icon: <DashboardIcon /> },
      { label: "Người dùng", path: "/admin/users", icon: <PeopleIcon /> },
      { label: "Quản lý quyền", path: "/admin/roles", icon: <SecurityIcon /> },
      { label: "Quản lý Coin", path: "/admin/coins", icon: <CurrencyBitcoinIcon /> },
      { label: "Duyệt rút tiền", path: "/admin/withdrawals", icon: <PaymentIcon /> },
      // 🔥 CHUYỂN "CÀI ĐẶT" LÊN ĐÂY
      { label: "Cài đặt", path: "/admin/settings", icon: <SettingsIcon /> },
    ]
  }
];

export default function AdminSidebar({ width }) {
  const location = useLocation();
  
  return (
    <Box
      component="nav"
      sx={{
        width: { xs: 0, md: width },
        flexShrink: 0,
        bgcolor: "background.default", 
        borderRight: "none", 
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        py: 2
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((group, index) => (
          <Box key={index} mb={1}> 
            {/* Đã xóa phần hiển thị Typography "Hệ thống" */}

            <List disablePadding>
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 2,
                      mb: 1,
                      
                      // 🔥 SỬA: borderRadius = 1 (4px) -> Hình chữ nhật bo nhẹ 4 góc
                      borderRadius: 1, 
                      
                      height: 48,
                      
                      bgcolor: active ? "action.selected" : "transparent",
                      color: active ? "text.primary" : "text.secondary",
                      
                      "& .MuiListItemIcon-root": {
                        color: "inherit"
                      },

                      "&:hover": { 
                         bgcolor: active ? "action.selected" : "action.hover",
                         color: "text.primary" 
                      },
                      
                      transition: "all 0.2s"
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                        {item.icon}
                    </ListItemIcon>
                    
                    <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ 
                            fontSize: "1rem", 
                            fontWeight: active ? 700 : 500 
                        }} 
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}