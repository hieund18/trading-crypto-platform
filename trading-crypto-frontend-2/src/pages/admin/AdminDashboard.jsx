import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <Typography variant="h5" fontWeight={700} color="white" mb={3}>
        Tổng quan hệ thống
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            color: "white",
            flex: "1 1 250px"
          }}
        >
          <Typography fontSize={14} color="#94a3b8">
            Tổng số người dùng
          </Typography>
          <Typography fontSize={28} fontWeight={700}>
            1,234
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            color: "white",
            flex: "1 1 250px"
          }}
        >
          <Typography fontSize={14} color="#94a3b8">
            Tổng số coin
          </Typography>
          <Typography fontSize={28} fontWeight={700}>
            120
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155",
            color: "white",
            flex: "1 1 250px"
          }}
        >
          <Typography fontSize={14} color="#94a3b8">
            Log trong 24h
          </Typography>
          <Typography fontSize={28} fontWeight={700}>
            879
          </Typography>
        </Paper>
      </Box>
    </AdminLayout>
  );
}
