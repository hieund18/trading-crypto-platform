// src/components/admin/AdminSidebar.jsx
import React from "react";
import { 
  Box, List, ListItemButton, ListItemIcon, ListItemText 
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import SecurityIcon from '@mui/icons-material/Security'; // <-- Có thể bỏ import này nếu không dùng nữa
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

// Import Auth
import { useAuth } from "../../context/AuthContext";
import { logoutApi } from "../../api/authApi";
import { getRefreshToken } from "../../api/tokenUtils";

const menuItems = [
  { 
    section: "Main",
    items: [
      { label: "Tổng quan", path: "/admin", icon: <DashboardIcon /> },
      { label: "Người dùng", path: "/admin/users", icon: <PeopleIcon /> },
      { label: "Quản lý Coin", path: "/admin/coins", icon: <CurrencyBitcoinIcon /> },
      { label: "Quản lý giao dịch", path: "/admin/transactions", icon: <ReceiptLongIcon /> },
      // 🔥 ĐÃ XÓA MỤC PHÂN QUYỀN Ở ĐÂY
      // { label: "Phân quyền", path: "/admin/roles", icon: <SecurityIcon /> }, 
      { label: "Cài đặt", path: "/admin/settings", icon: <SettingsIcon /> },
    ]
  }
];

export default function AdminSidebar({ width }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const token = getRefreshToken();
    try {
      if (token) await logoutApi(token);
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      logout();
    }
  };
  
  const getItemSx = (isActive) => ({
    mx: 2, mb: 1, borderRadius: 1, height: 48,
    bgcolor: isActive ? "action.selected" : "transparent",
    color: isActive ? "text.primary" : "text.secondary",
    "& .MuiListItemIcon-root": { color: "inherit" },
    "&:hover": { 
        bgcolor: isActive ? "action.selected" : "action.hover",
        color: "text.primary" 
    },
    transition: "all 0.2s"
  });

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
        py: 2,
        height: "100vh"
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((group, index) => (
          <Box key={index} mb={1}> 
            <List disablePadding>
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={getItemSx(active)}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                        {item.icon}
                    </ListItemIcon>
                    
                    <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ fontSize: "1rem", fontWeight: active ? 700 : 500 }} 
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
        
        <Box mt={1}>
            <ListItemButton onClick={handleLogout} sx={getItemSx(false)}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                    primary="Đăng xuất" 
                    primaryTypographyProps={{ fontSize: "1rem", fontWeight: 500 }} 
                />
            </ListItemButton>
        </Box>

      </Box>
    </Box>
  );
}