import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";
import TwoFactorLogin from "../pages/auth/TwoFactorLogin";
import VerifyEmailOtp from "../pages/auth/VerifyEmailOtp";
import Authenticate from "../pages/auth/Authenticate";

import Home from "../pages/Home";

import Dashboard from "../pages/Dashboard";

import MarketPage from "../pages/markets/MarketPage";
import CoinDetailPage from "../pages/coin/CoinDetailPage";

import PortfolioPage from "../pages/portfolio/PortfolioPage";
import TradeHistoryPage from "../pages/history/TradeHistoryPage";

import WalletPage from "../pages/wallet/WalletPage";
import WalletHistoryPage from "../pages/wallet/WalletHistoryPage";

import WatchlistPage from "../pages/watchlist/WatchlistPage";

import SettingsPage from "../pages/settings/SettingsPage";

// Admin Pages (IMPORT MỚI)
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import CoinManagement from "../pages/admin/CoinManagement";

// Guards
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import FlowGuard from "./FlowGuard";

export default function AppRouter() {
  return (
    <Routes>
      {/* --- AUTH ROUTES --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route path="/verify-otp" element={
          <FlowGuard required={["email"]}> <VerifyOtp /> </FlowGuard>
      } />
      <Route path="/reset-password" element={
          <FlowGuard required={["resetToken"]}> <ResetPassword /> </FlowGuard>
      } />
      <Route path="/two-factor-login" element={
          <FlowGuard required={["email"]} redirectTo="/"> <TwoFactorLogin /> </FlowGuard>
      } />
      <Route path="/verify-email" element={
          <FlowGuard required={["email"]} redirectTo="/"> <VerifyEmailOtp /> </FlowGuard>
      } />

      <Route path="/authenticate" element={<Authenticate />} />

      {/* --- PUBLIC ROUTES --- */}
      <Route path="/" element={<Home />} />
      <Route path="/markets" element={<MarketPage />} />
      <Route path="/trade/:id" element={<CoinDetailPage />} />

      {/* --- USER ROUTES --- */}
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/portfolio" element={<UserRoute><PortfolioPage /></UserRoute>} />
      <Route path="/trade-history" element={<UserRoute><TradeHistoryPage /></UserRoute>} />
      <Route path="/wallet" element={<UserRoute><WalletPage /></UserRoute>} />
      <Route path="/wallet-history" element={<UserRoute><WalletHistoryPage /></UserRoute>} />
      <Route path="/watchlist" element={<UserRoute><WatchlistPage /></UserRoute>} />
      <Route path="/settings" element={<UserRoute><SettingsPage /></UserRoute>} />

      {/* --- ADMIN ROUTES (CẤU HÌNH MỚI) --- */}
      {/* Trang Dashboard Admin */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* Trang Quản lý Người dùng */}
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } 
      />

      <Route 
        path="/admin/coins" 
        element={
          <AdminRoute>
            <CoinManagement />
          </AdminRoute>
        } 
      />

      {/* --- ADMIN SETTINGS (Tái sử dụng) --- */}
      <Route 
        path="/admin/settings" 
        element={
          <AdminRoute>
            {/* 🔥 Truyền prop isAdmin để đổi Layout */}
            <SettingsPage isAdmin={true} />
          </AdminRoute>
        } 
      />

      {/* NOT FOUND → chuyển về Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
