import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * FlowGuard bảo vệ flow nhiều bước.
 *
 * required: array các key required trong location.state
 * redirectTo: nếu thiếu state thì redirect đến đâu?
 */
export default function FlowGuard({ required = [], redirectTo = "/", children }) {
  const location = useLocation();
  const state = location.state || {};

  const missing = required.some((key) => !state[key]);

  if (missing) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
