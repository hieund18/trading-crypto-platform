// src/api/walletApi.js
import api from "./axiosInstance";

// 1. Lấy thông tin ví chính (Lấy số dư USDT)
export async function getMyWalletApi() {
  // Endpoint: http://localhost:8888/api/v1/wallet/wallets/my-wallet
  const res = await api.get("/wallet/wallets/my-wallet");
  return res.data;
}

// 2. Lấy lịch sử giao dịch ví
// Params: { page, size, type }
// type: DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT, TRADE_BUY, TRADE_SELL, REFUND
export async function getMyWalletTransactionApi(params = {}) {
  const res = await api.get("/wallet/wallets/my-wallet-transaction", { params });
  return res.data;
}

// 3. API Rút tiền (MỚI)
export async function withdrawApi(payload) {
  // payload: { bankName, bankAccount, amount }
  const res = await api.post("/wallet/wallets/withdraw", payload);
  return res.data;
}

// 4. Gửi OTP rút tiền (Bước 2 hoặc Resend)
export async function sendWithdrawOtpApi(withdrawId) {
  // Giả sử API cần withdrawId để biết gửi OTP cho giao dịch nào
  const res = await api.post("/wallet/wallets/withdraw/send-otp", { withdrawId });
  return res.data;
}

// 5. Xác thực OTP rút tiền (Bước 3: Hoàn tất)
export async function verifyWithdrawOtpApi(withdrawId, otpCode) {
  const res = await api.post("/wallet/wallets/withdraw/verify-otp", {
    withdrawId,
    otpCode
  });
  return res.data;
}

// 6. Lấy lịch sử yêu cầu rút tiền (API MỚI)
export async function getMyWithdrawalHistoryApi(params = {}) {
  // params: { page, size }
  const res = await api.get("/wallet/wallets/withdraw/my-withdrawal", { params });
  return res.data;
}

// 7. Tạo yêu cầu chuyển tiền
export async function transferApi(payload) {
  // payload: { toWalletId, amount }
  const res = await api.post("/wallet/wallets/transfer", payload);
  return res.data;
}

// 8. Gửi OTP chuyển tiền (Dùng cho cả gửi lần đầu và Gửi lại)
export async function sendTransferOtpApi(transferId) {
  // Body dự kiến: { transferId: "..." }
  const res = await api.post("/wallet/wallets/transfer/send-otp", { transferId });
  return res.data;
}

// 9. Xác thực OTP chuyển tiền
export async function verifyTransferOtpApi(transferId, otpCode) {
  // payload: { transferId, otpCode }
  const res = await api.post("/wallet/wallets/transfer/verify-otp", {
    transferId,
    otpCode
  });
  return res.data;
}