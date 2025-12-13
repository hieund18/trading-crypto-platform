// src/hooks/useCoinTicker.js

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Cấu hình URL Socket
const SOCKET_URL = import.meta.env.VITE_WS_URL; 

export const useCoinTicker = (initialCoins) => {
  const [coins, setCoins] = useState(initialCoins);
  const stompClientRef = useRef(null);

  // 1. Khi danh sách coin đầu vào thay đổi (ví dụ chuyển trang), reset state
  useEffect(() => {
    setCoins(initialCoins);
  }, [initialCoins]);

  // 2. Kết nối WebSocket
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000, // Tự kết nối lại sau 5s
      onConnect: () => {
        console.log("🟢 Connected to WebSocket");
        
        // Subscribe kênh chung
        client.subscribe("/topic/tickers", (message) => {
          if (message.body) {
            const updates = JSON.parse(message.body);
            handleSocketUpdate(updates);
          }
        });
      },
      onStompError: (frame) => {
        console.error("🔴 Socket error: " + frame.headers["message"]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Cleanup khi unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  // 3. Hàm xử lý update (Logic Fallback chống về 0)
  const handleSocketUpdate = (updates) => {
    setCoins((prevCoins) => {
      // Nếu danh sách cũ rỗng, bỏ qua
      if (!prevCoins || prevCoins.length === 0) return prevCoins;

      const newCoins = [...prevCoins];
      let hasChange = false;

      newCoins.forEach((coin, index) => {
        // Tìm gói tin update tương ứng với coin này
        const updateData = updates.find((u) => u.binanceSymbol === coin.binanceSymbol);

        if (updateData) {
          // 🔥 LOGIC QUAN TRỌNG:
          // - Dùng toán tử || để lấy giá trị fallback.
          // - Nếu updateData.currentPrice là 0 hoặc null -> Dùng coin.currentPrice (cũ)
          
          const newPrice = updateData.currentPrice || coin.currentPrice;
          
          // Với phần trăm, cẩn thận với số 0. Nhưng thường lỗi sẽ trả về null.
          // Ta kiểm tra null/undefined kỹ hơn.
          const newPercent = (updateData.priceChangePercentage24h !== undefined && updateData.priceChangePercentage24h !== null)
                             ? updateData.priceChangePercentage24h 
                             : coin.priceChangePercentage24h;

          // Chỉ cập nhật nếu có sự thay đổi thực sự
          if (newPrice !== coin.currentPrice || newPercent !== coin.priceChangePercentage24h) {
             newCoins[index] = {
              ...coin,
              currentPrice: newPrice,
              priceChangePercentage24h: newPercent,
              // Giữ nguyên các trường khác (Volume, Cap, Name...)
            };
            hasChange = true;
          }
        }
      });

      return hasChange ? newCoins : prevCoins;
    });
  };

  return coins; // Trả về danh sách coin đã được cập nhật real-time
};