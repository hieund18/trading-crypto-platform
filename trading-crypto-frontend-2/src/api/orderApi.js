// src/api/orderApi.js
import api from "./axiosInstance";

// 1. API Lấy số lượng Coin khả dụng (để bán)
export async function getAssetAvailabilityApi(coinId) {
  const res = await api.get(`/order/assets/available/${coinId}`);
  return res.data;
}

// 2. API MUA (Theo số tiền USDT)
export async function buyCoinApi(coinId, amount) {
  // Payload: { coinId: "bitcoin", amount: "100" }
  const res = await api.post("/order/assets/buy", {
    coinId,
    amount: String(amount)
  });
  return res.data;
}

// 3. API BÁN (SỬA LẠI: Gửi quantity - Coin)
export async function sellCoinApi(coinId, quantity) {
  // Payload: { coinId: "bitcoin", quantity: "0.010979" }
  const res = await api.post("/order/assets/sell", {
    coinId,
    quantity: String(quantity) // <-- Đổi key thành quantity
  });
  return res.data;
}

// 4. Lấy danh mục đầu tư (Portfolio)
export async function getMyPortfolioApi() {
  const res = await api.get("/order/assets/my-portfolio");
  return res.data;
}

// MỚI: Lấy lịch sử giao dịch
export async function getMyTradeHistoryApi(params) {
  // params: { page, size, type }
  const res = await api.get("/order/assets/my-trade-history", { params });
  return res.data;
}

// 🔥 API Lấy dữ liệu biểu đồ Volume (MỚI)
export async function getVolumeChartApi(params) {
  // params: { timeType: "HOUR" | "DAY" | "MONTH", from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
  const res = await api.get("/order/volume/chart", { params });
  return res.data;
}

// 🔥 API Top Users theo Volume
export async function getTopUsersVolumeApi(params) {
  // params: { from, to }
  const res = await api.get("/order/volume/ranking/users", { params });
  return res.data;
}

// 🔥 API Top Coins theo Volume
export async function getTopCoinsVolumeApi(params) {
  // params: { from, to }
  const res = await api.get("/order/volume/ranking/coins", { params });
  return res.data;
}