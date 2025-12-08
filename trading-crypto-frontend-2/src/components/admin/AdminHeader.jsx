// src/components/admin/AdminHeader.jsx
import React, { useState } from "react";
import { 
  Box, IconButton, Stack, Avatar, Menu, MenuItem, 
  ListItemIcon, Divider, Typography, AppBar, Toolbar 
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import Logo from "../common/Logo";
import { logoutApi } from "../../api/authApi";
import { getRefreshToken } from "../../api/tokenUtils";

// Icons
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// import SecurityIcon from '@mui/icons-material/Security'; // <-- Có thể bỏ import này
import SettingsIcon from '@mui/icons-material/Settings';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    const token = getRefreshToken();
    try {
      if (token) await logoutApi(token);
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      handleClose();
      logout();
    }
  };

  const displayName = user?.profile?.fullName || user?.username;
  const displayEmail = user?.email;
  const displayAvatar = user?.profile?.avatar;

  const menuItemSx = {
    mx: 1, 
    mb: 0.5, 
    borderRadius: 1, 
    color: "text.secondary",
    "& .MuiListItemIcon-root": { color: "inherit", minWidth: 36 },
    "&:hover": { 
        bgcolor: "action.hover", 
        color: "text.primary" 
    },
    transition: "all 0.2s",
    py: 1.2
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        bgcolor: "background.default", 
        borderBottom: "none",
        color: "text.primary"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        
        <Link to="/admin" style={{ textDecoration: 'none' }}>
           <Logo size={40} showText={true} /> 
        </Link>
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          
          <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
            <Avatar 
              src={displayAvatar} 
              sx={{ 
                bgcolor: "primary.main", 
                width: 36, height: 36, 
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700
              }}
            >
              {displayName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: { 
                width: 260, 
                borderRadius: 2, 
                mt: 1.5,
                border: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar src={displayAvatar} sx={{ bgcolor: "primary.main" }}>
                {displayName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight={700} color="text.primary">
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {displayEmail}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <MenuItem component={Link} to="/admin" onClick={handleClose} sx={menuItemSx}>
              <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
              Tổng quan
            </MenuItem>
            
            <MenuItem component={Link} to="/admin/users" onClick={handleClose} sx={menuItemSx}>
              <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
              Người dùng
            </MenuItem>
            
            <MenuItem component={Link} to="/admin/coins" onClick={handleClose} sx={menuItemSx}>
              <ListItemIcon><CurrencyBitcoinIcon fontSize="small" /></ListItemIcon>
              Quản lý Coin
            </MenuItem>
            
            <MenuItem component={Link} to="/admin/transactions" onClick={handleClose} sx={menuItemSx}>
              <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
              Quản lý giao dịch
            </MenuItem>
            
            {/* 🔥 ĐÃ XÓA MỤC PHÂN QUYỀN TẠI ĐÂY */}
            
            <MenuItem component={Link} to="/admin/settings" onClick={handleClose} sx={menuItemSx}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              Cài đặt
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleLogout} sx={menuItemSx}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>

          <IconButton onClick={toggleTheme} sx={{ color: "text.primary" }}>
            {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>

        </Stack>
      </Toolbar>
    </AppBar>
  );
}