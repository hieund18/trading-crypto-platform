import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        color: "white",
        p: 2,
        borderBottom: "1px solid #334155",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <Typography fontSize={18} fontWeight={700}>
        Admin Dashboard
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography>{user?.username}</Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={logout}
          sx={{ borderColor: "#ef4444", color: "#ef4444" }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
