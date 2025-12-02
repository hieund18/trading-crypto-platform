// src/api/roleApi.js
import api from "./axiosInstance";

// Endpoint: /identity/roles
export async function getAllRolesApi() {
  const res = await api.get("/identity/roles");
  return res.data;
}