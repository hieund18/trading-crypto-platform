import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
} from "@mui/material";

import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import CoinSearchBar from "../navbar/CoinSearchBar";

// 1. IMPORT CÁC ICON MỚI
import { useThemeContext } from "../../context/ThemeContext"; // Hook mới
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Icon Mặt trăng (Dark)
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Icon Mặt trời (Light)

import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

export default function MainNavbar() {
  const { user, logout, loadingUser } = useAuth();
  const nav = useNavigate();

  // 2. GỌI HOOK ĐỂ LẤY THEME HIỆN TẠI VÀ HÀM THAY ĐỔI
  const { mode, toggleTheme } = useThemeContext();

  if (loadingUser) return null; // Ngăn flash

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    nav("/");
  };

  const activeStyle = {
    fontWeight: 700,
    color: "#3b82f6",
  };

  const defaultStyle = {
    fontWeight: 500,
    color: "#e2e8f0",
    textDecoration: "none",
    "&:hover": {
      color: "#3b82f6",
    },
  };

  const navLinks = user
    ? [
        { title: "Dashboard", to: "/dashboard" },
        { title: "Thị trường", to: "/markets" },
        { title: "Giao dịch", to: "/trade/BTCUSDT" },
        { title: "Danh mục", to: "/portfolio" },
        { title: "Ví", to: "/wallet" },
      ]
    : [
        { title: "Thị trường", to: "/markets" },
        { title: "Giao dịch", to: "/trade/BTCUSDT" },
      ];

  return (
    <AppBar
      position="sticky"
      sx={{ bgcolor: "#1e293b", borderBottom: "1px solid #334155" }}
    >
      <Toolbar
        sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
      >
        <Link component={RouterLink} to="/" sx={{ textDecoration: "none" }}>
          <Logo size={40} showText />
        </Link>

        <Box display="flex" gap={3}>
          {navLinks.map((item) => (
            <Link
              key={item.title}
              component={NavLink}
              to={item.to}
              underline="none"
              sx={defaultStyle}
              style={({ isActive }) => (isActive ? activeStyle : {})}
            >
              {item.title}
            </Link>
          ))}
        </Box>

        <Box sx={{ minWidth: 240 }}>
          <CoinSearchBar />
        </Box>

        {user ? (
          <Box display="flex" gap={1.5} alignItems="center">
            <IconButton
              component={RouterLink}
              to="/watchlist"
              sx={{ color: "#e2e8f0" }}
            >
              <BookmarkBorderOutlinedIcon />
            </IconButton>

            <IconButton onClick={handleOpenMenu}>
              <Avatar sx={{ bgcolor: "#3b82f6", width: 32, height: 32 }}>
                {user.username?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
              <MenuItem onClick={() => nav("/profile")}>
                <ListItemIcon>
                  <AccountCircleOutlinedIcon />
                </ListItemIcon>
                Thông tin cá nhân
              </MenuItem>

              <MenuItem onClick={() => nav("/wallet")}>
                <ListItemIcon>
                  <AccountBalanceWalletOutlinedIcon />
                </ListItemIcon>
                Ví của tôi
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              sx={{
                textDecoration: "none",
                color: "white",
                borderColor: "#555",
              }}
            >
              Đăng nhập
            </Button>

            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              sx={{ textDecoration: "none", bgcolor: "#3b82f6" }}
            >
              Đăng ký
            </Button>
          </Box>
        )}

        <IconButton onClick={toggleTheme} sx={{ color: "white" }}>
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
