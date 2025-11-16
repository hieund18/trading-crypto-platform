import React from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { Typography } from "@mui/material";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <Typography color="white" variant="h4">Xin chào {user?.username}</Typography>
      <Typography color="#94a3b8">Chào mừng bạn đến BitStorm!</Typography>
    </MainLayout>
  );
}
