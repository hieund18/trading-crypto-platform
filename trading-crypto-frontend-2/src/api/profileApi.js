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

// 🔥 API Lấy danh sách Profile theo danh sách ID
export async function getListProfilesApi(userIds) {
  // userIds: "id1,id2,id3" (string phân cách bởi dấu phẩy)
  // Lưu ý: Endpoint trong yêu cầu của bạn là /profile/internal/users
  // Cần kiểm tra xem axiosInstance của bạn đang trỏ tới đâu.
  // Nếu base URL khác, cần dùng axios.create riêng hoặc chỉnh url đầy đủ.
  
  // Giả sử api instance đã trỏ đúng gateway hoặc service profile
  const res = await api.get(`/profile/users/list`, { // Sửa lại endpoint cho đúng chuẩn REST nếu cần
      params: { ids: userIds } // Truyền param ids hoặc userIds tùy backend
  });
  // Theo đề bài của bạn endpoint là: /profile/internal/users?userIds=...
  // Nếu axiosInstance base là /api/v1, ta cần override hoặc chỉnh lại.
  // Ở đây tôi giả định bạn đã cấu hình proxy hoặc base url phù hợp.
  
  return res.data;
}

// 🔥 API Lấy danh sách Profile theo Batch (MỚI)
export async function getPublicProfilesApi(userIds) {
  // Endpoint: /profile/users/batch?userIds=id1,id2
  const res = await api.get("/profile/users/batch", {
    params: { userIds: userIds }
  });
  return res.data;
}