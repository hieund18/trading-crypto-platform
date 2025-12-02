// src/api/profileApi.js
import api from "./axiosInstance";

export async function getMyProfileApi() {
  const res = await api.get("/profile/users/my-profile");
  return res.data; // { code, result }
}

// 🔥 1. Cập nhật thông tin cá nhân
export async function updateUserProfileApi(data) {
  // data: { fullName, dob, address }
  const res = await api.put("/profile/users/my-profile", data);
  return res.data;
}

// 🔥 2. Cập nhật Avatar
export async function uploadAvatarApi(file) {
  const formData = new FormData();
  formData.append("file", file); // Key là 'file' (thông thường)

  const res = await api.put("/profile/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}