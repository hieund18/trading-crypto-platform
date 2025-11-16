import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const roles = user?.roles?.map((r) => r.name) || [];

  return roles.includes("USER") || roles.includes("ADMIN")
    ? children
    : <Navigate to="/login" replace />;
}
