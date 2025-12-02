import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserRoute({ children }) {
  const { user, loading, isLoggingOut } = useAuth();

  if (loading) return null;

  if (isLoggingOut) {
    return <Navigate to="/" replace />;
  }

  const roles = user?.roles?.map((r) => r.name) || [];

  return roles.includes("USER") || roles.includes("ADMIN")
    ? children
    : <Navigate to="/login" replace />;
}
