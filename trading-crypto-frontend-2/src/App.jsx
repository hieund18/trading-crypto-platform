import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFactorLogin from "./pages/auth/TwoFactorLogin";
import Home from "./pages/Home";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return 
    // <Routes>
      {/* AUTH ROUTES */}
      {/* <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/two-factor-login" element={<TwoFactorLogin />} /> */}

      {/* Chạy lần đầu nếu vào root thì chuyển đến login */}
      {/* <Route path="*" element={<Login />} /> */}

      {/* HOME */}
      {/* <Route path="/" element={<Home />} /> */}

      {/* NOT FOUND */}
      {/* <Route path="*" element={<Navigate to="/" />} /> */}
    // </Routes>
    <AppRouter/>
  
}
