// src/hooks/useSingleCoinTicker.js
import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8888/api/v1/coin/ws";

export const useSingleCoinTicker = (initialCoin) => {
  const [coin, setCoin] = useState(initialCoin);
  const stompClientRef = useRef(null);

  // 1. Reset state khi initialCoin thay đổi (vd: đổi từ BTC sang ETH)
  useEffect(() => {
    setCoin(initialCoin);
  }, [initialCoin]);

  // 2. Kết nối WebSocket
  useEffect(() => {
    if (!initialCoin?.binanceSymbol) return; // Chưa có data thì chưa connect

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`🟢 Connected to single ticker: ${initialCoin.binanceSymbol}`);

        // Subscribe đúng topic riêng lẻ: /topic/ticker/btcusdt
        const topic = `/topic/ticker/${initialCoin.binanceSymbol}`;

        client.subscribe(topic, (message) => {
          if (message.body) {
            const updateData = JSON.parse(message.body);
            handleSocketUpdate(updateData);
          }
        });
      },
      onStompError: (frame) => {
        console.error("🔴 Socket error: " + frame.headers["message"]);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Cleanup
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [initialCoin?.binanceSymbol]); // Chỉ connect lại khi symbol thay đổi

  // 3. Xử lý update (Merge data mới vào data cũ)
  const handleSocketUpdate = (updateData) => {
    setCoin((prevCoin) => {
      if (!prevCoin) return updateData;

      // Kiểm tra xem giá có thực sự thay đổi không để tránh render thừa
      const newPrice = updateData.currentPrice || prevCoin.currentPrice;
      const newPercent = updateData.priceChangePercentage24h ?? prevCoin.priceChangePercentage24h;

      if (newPrice !== prevCoin.currentPrice || newPercent !== prevCoin.priceChangePercentage24h) {
        return {
          ...prevCoin,
          ...updateData, // Ghi đè thông tin mới (giá, vol, %...)
        };
      }
      
      return prevCoin;
    });
  };

  return coin;
};