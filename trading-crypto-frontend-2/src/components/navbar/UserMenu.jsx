// src/components/navbar/UserMenu.jsx
import React from "react";
import {
  Box, Avatar, Menu, MenuItem, Divider, ListItemIcon, Typography, IconButton
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutApi } from "../../api/authApi";
import { getRefreshToken } from "../../api/tokenUtils";

// Icons
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    const token = getRefreshToken();
    try {
      if (token) await logoutApi(token);
    } catch (error) {
      console.error("API Logout failed:", error);
    } finally {
      handleClose();
      logout();
    }
  };

  const displayName = user.profile?.fullName || user.username;
  const displayAvatar = user.profile?.avatar;

  return (
    <Box sx={{ display: "inline-block" }}>
      <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
        <Avatar src={displayAvatar} sx={{ bgcolor: "primary.main", width: 32, height: 32, cursor: "pointer", fontWeight: 700 }}>
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
            bgcolor: "background.popup", // 🔥 SỬ DỤNG MÀU MỚI (Admin/User Menu sẽ giống màu Dialog)
            border: "1px solid", 
            borderColor: "divider", 
            mt: 1.5 
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar src={displayAvatar} sx={{ bgcolor: "primary.main", fontWeight: 700 }}>{displayName?.charAt(0)?.toUpperCase()}</Avatar>
          <Box>
            <Typography fontWeight={700} color="text.primary">{displayName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{fontSize: '0.75rem'}}>{user.email}</Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem component={Link} to="/portfolio" onClick={handleClose}>
          <ListItemIcon><TrendingUpOutlinedIcon fontSize="small" /></ListItemIcon>
          Danh mục đầu tư
        </MenuItem>

        <MenuItem component={Link} to="/wallet" onClick={handleClose}>
          <ListItemIcon><AccountBalanceWalletOutlinedIcon fontSize="small" /></ListItemIcon>
          Ví của tôi
        </MenuItem>

        <MenuItem component={Link} to="/settings" onClick={handleClose}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          Cài đặt
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
}