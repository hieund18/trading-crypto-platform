// src/api/userApi.js
import api from "./axiosInstance";

// Endpoint quản lý User (Identity Service)
const BASE_URL = "/identity/users";

// 1. Lấy danh sách User (Admin)
export async function getAllUsersApi(params) {
  // params: { page, size, keyword, isActive }
  const res = await api.get(BASE_URL, { params });
  return res.data; 
}

// 🔥 2. Cập nhật trạng thái User (Khóa/Mở khóa) [MỚI]
export async function updateUserStatusApi(userId) {
  // Endpoint: /identity/users/status/{userId}
  // Method: PATCH
  const res = await api.patch(`${BASE_URL}/status/${userId}`);
  return res.data;
}

export async function updateUserRolesApi(userId, roleIds) {
  // Endpoint: /identity/users/roles/{userId}
  // Body: { "roleId": [1, 2] }
  const res = await api.put(`${BASE_URL}/roles/${userId}`, {
    roleId: roleIds
  });
  return res.data;
}