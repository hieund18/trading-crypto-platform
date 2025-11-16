import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import TwoFactorLogin from "../pages/auth/TwoFactorLogin";
import VerifyEmailOtp from "../pages/auth/VerifyEmailOtp";

import Home from "../pages/Home";

// import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import FlowGuard from "./FlowGuard";

import Dashboard from "../pages/Dashboard";

import AdminHome from "../pages/admin/AdminDashboard";

export default function AppRouter() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/verify-otp"
        element={
          <FlowGuard required={["email"]}>
            <VerifyOtp />
          </FlowGuard>
        }
      />

      <Route
        path="/reset-password"
        element={
          <FlowGuard required={["resetToken"]}>
            <ResetPassword />
          </FlowGuard>
        }
      />

      <Route
        path="/two-factor-login"
        element={
          <FlowGuard required={["email"]} redirectTo="/">
            <TwoFactorLogin />
          </FlowGuard>
        }
      />

      <Route
        path="/verify-email"
        element={
          <FlowGuard required={["email"]} redirectTo="/">
            <VerifyEmailOtp />
          </FlowGuard>
        }
      />

      {/* HOME */}
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={
          <UserRoute>
            <Dashboard />
          </UserRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminHome /> {/* trang admin bạn sẽ tạo */}
          </AdminRoute>
        }
      />

      {/* NOT FOUND → chuyển về Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
