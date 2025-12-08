// src/components/layout/MainNavbar.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link,
  IconButton,
} from "@mui/material";

import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import CoinSearchBar from "../navbar/CoinSearchBar";
import UserMenu from "../navbar/UserMenu"; 

import { useThemeContext } from "../../context/ThemeContext";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

export default function MainNavbar() {
  const { user, loading } = useAuth();
  const { mode, toggleTheme } = useThemeContext();

  if (loading) return null;

  const activeStyle = {
    fontWeight: 600,
    color: "primary.main",
  };

  const defaultStyle = {
    fontWeight: 600,
    color: "text.primary",
    textDecoration: "none",
    "&:hover": {
      color: "primary.main",
    },
  };

  // 🔥 1. ĐÃ XÓA MỤC "Dashboard"
  const navLinks = [
    { title: "Thị trường", to: "/markets" },
    { title: "Giao dịch", to: "/trade/bitcoin" },
    // { title: "Dashboard", to: "/dashboard" }, // <--- ĐÃ BỎ
    { title: "Danh mục đầu tư", to: "/portfolio" },
    { title: "Ví", to: "/wallet" },
    { title: "Bảng xếp hạng", to: "/leaderboard" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.default",
        // 🔥 2. ĐÃ BỎ VIỀN KẺ DƯỚI
        // borderBottom: "1px solid", 
        // borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* === 1. NHÓM BÊN TRÁI (LOGO + MENU) === */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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
        </Box>

        {/* === 2. NHÓM BÊN PHẢI === */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ minWidth: 240 }}>
            <CoinSearchBar />
          </Box>

          {user ? (
            <React.Fragment>
              <Button
                component={RouterLink}
                to="/watchlist"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                startIcon={<StarBorderRoundedIcon />}
              >
                Danh sách theo dõi
              </Button>

              <UserMenu />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{
                  textDecoration: "none",
                  color: "text.primary",
                  borderColor: "divider",
                }}
              >
                Đăng nhập
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                sx={{ textDecoration: "none" }}
              >
                Đăng ký
              </Button>
            </React.Fragment>
          )}

          <IconButton
            onClick={toggleTheme}
            sx={{
              color: "text.primary",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            {mode === "dark" ? (
              <LightModeOutlinedIcon />
            ) : (
              <DarkModeOutlinedIcon />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}