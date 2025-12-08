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

export async function updateCoinStatusApi(coinId) {
  // Endpoint: PATCH /coin/markets/status/{id}
  const res = await api.patch(`/coin/markets/status/${coinId}`);
  return res.data;
}

// 1. Tìm kiếm Binance Symbol [MỚI]
export async function searchBinanceSymbolsApi(keyword = "") {
  const params = { page: 1, size: 20 }; // Lấy 20 kết quả gợi ý
  if (keyword) params.keyword = keyword;
  
  // Endpoint: /coin/master/binance-symbol/search
  const res = await api.get("/coin/master/binance-symbol/search", { params });
  return res.data;
}

// 2. Cập nhật Binance Symbol cho Coin [MỚI]
export async function updateCoinBinanceSymbolApi(coinId, binanceSymbol) {
  // Endpoint: PUT /coin/markets/binance-symbol/{id}
  const res = await api.put(`/coin/markets/binance-symbol/${coinId}`, {
    binanceSymbol
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

export async function searchCoinGeckoApi(keyword) {
  // Endpoint: /coin/master/coingecko/search
  // Params: keyword, size=50
  const params = { keyword, size: 50 };
  const res = await api.get("/coin/master/coingecko/search", { params });
  return res.data;
}

// 🔥 2. Thêm coin mới vào hệ thống
export async function addCoinToMarketApi(coinGeckoId) {
  // Endpoint: POST /coin/markets
  // Body: { "id": "bitcoin" }
  const res = await api.post("/coin/markets", {
    id: coinGeckoId
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

