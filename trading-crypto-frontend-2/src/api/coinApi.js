// src/api/coinApi.js
import api from "./axiosInstance";

// Lấy danh sách thị trường (Dùng API Search)
// Default params: page = 1, size = 10 (Backend tự xử lý nếu không truyền)
export async function getMarketsApi(params = {}) {
  const res = await api.get("/coin/markets/search", { params });
  return res.data;
}

export async function getTrendingApi(params = {}) {
  // API Trending cũng hỗ trợ phân trang
  const res = await api.get("/coin/markets/trending", { params });
  return res.data;
}

export async function getMarketChartApi(id, params) {
  const res = await api.get("/coin/markets/charts", {
    params: {
      id,
      ...params,
    },
  });
  return res.data;
}

// CẬP NHẬT: API lấy chi tiết 1 coin theo ID trực tiếp
export async function getCoinDetailApi(id) {
  const res = await api.get(`/coin/markets/${id}`);
  return res.data;
}

export async function updateCoinStatusApi(coinId, isActive) {
  // Giả sử endpoint backend là PATCH /coin/markets/{id}/status
  const res = await api.patch(`/coin/markets/${coinId}/status`, {
    isActive: isActive
  });
  return res.data;
}

// API chuyển đổi: Nhập số lượng Coin -> Ra số tiền USDT
export async function convertQuantityToAmountApi(coinId, quantity) {
  const res = await api.post("/coin/markets/convert/quantity-to-amount", {
    coinId,
    quantity: String(quantity), // Đảm bảo gửi dạng string
  });
  return res.data;
}

// API chuyển đổi: Nhập số tiền USDT -> Ra số lượng Coin
export async function convertAmountToQuantityApi(coinId, amount) {
  const res = await api.post("/coin/markets/convert/amount-to-quantity", {
    coinId,
    amount: String(amount),
  });
  return res.data;
}

// ==========================================
// 🔥 WATCHLIST APIs
// ==========================================

// 1. Lấy danh sách theo dõi
export async function getMyWatchlistApi() {
  const res = await api.get("/coin/watchlists/my-watchlist");
  return res.data;
}

// 2. Thêm vào danh sách theo dõi
export async function addToWatchlistApi(coinId) {
  const res = await api.post(`/coin/watchlists/${coinId}`);
  return res.data;
}

// 3. Xóa khỏi danh sách theo dõi
export async function removeFromWatchlistApi(coinId) {
  const res = await api.delete(`/coin/watchlists/${coinId}`);
  return res.data;
}

