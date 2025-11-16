import React from "react";
import { Box, Typography, List, ListItemButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Coins", path: "/admin/coins" },
  { label: "Roles", path: "/admin/roles" },
  { label: "System Logs", path: "/admin/logs" }
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: { xs: 70, md: 250 },
        bgcolor: "#1e293b",
        color: "white",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: "1px solid #334155",
        p: 2
      }}
    >
      {/* Logo */}
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 3, display: { xs: "none", md: "block" } }}
      >
        ADMIN PANEL
      </Typography>

      <List>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: active ? "#334155" : "transparent",
                "&:hover": { bgcolor: "#334155" },
                color: "white",
                py: 1.2,
                px: 2
              }}
            >
              <Typography fontSize={16} fontWeight={500}>
                {item.label}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
