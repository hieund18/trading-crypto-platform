// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { token, loading } = useAuth();

//   // tránh nháy trắng khi reload
//   if (loading) return null;

//   // chưa đăng nhập → đẩy về login
//   if (!token) return <Navigate to="/login" replace />;

//   // đã login → hiển thị trang
//   return children;
// }