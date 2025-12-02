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