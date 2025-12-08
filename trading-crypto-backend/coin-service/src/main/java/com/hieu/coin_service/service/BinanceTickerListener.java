package com.hieu.coin_service.service;

import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.repository.CoinRepository;
import com.hieu.coin_service.util.RedisKeyUtil;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BinanceTickerListener {
    CoinRepository coinRepository;

    RedisTemplate<String, Object> redisTemplate;
    ObjectMapper objectMapper;
    ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();

    @NonFinal
    @Value("${outbound.market.binance.ws}")
    private String BINANCE_WS;

    private Set<String> supportedSymbols = ConcurrentHashMap.newKeySet();

    @PostConstruct
    public void start() {
        loadSupportedSymbols();

        connect();
    }

    public void loadSupportedSymbols() {
        List<String> binanceSymbols = coinRepository.findByIsActiveTrue().stream()
                .map(Coin::getBinanceSymbol)
                .filter(Objects::nonNull)
                .toList();

        supportedSymbols.clear();
        supportedSymbols.addAll(binanceSymbols);
        log.info("Updated supported symbols with {} coins", binanceSymbols.size());
    }

    public void connect() {
        try {
            WebSocketContainer container = ContainerProvider.getWebSocketContainer();
            container.setDefaultMaxTextMessageBufferSize(1024 * 1024);
            WebSocketClient client = new StandardWebSocketClient(container);

            client.doHandshake(new BinanceHandler(), BINANCE_WS)
                    .addCallback(result -> log.info("Conneted to Binance WS: {}", BINANCE_WS), ex -> {
                        log.error("Failed to connect to Binance WS, retrying...", ex);
                        scheduleReconnect();
                    });
        } catch (Exception exception) {
            log.error("Failed to connect to Binance WS, retrying...", exception);
            scheduleReconnect();
        }
    }

    private void scheduleReconnect() {
        scheduledExecutorService.schedule(this::connect, 3, TimeUnit.SECONDS);
        log.info("Reconnect in 3s...");
    }

    class BinanceHandler extends TextWebSocketHandler {
        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            try {
                JsonNode root = objectMapper.readTree(message.getPayload());

                if (!root.isArray()) return;

                redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
                    for (JsonNode node : root) {
                        String symbol = node.get("s").asText();
                        if (!supportedSymbols.contains(symbol)) continue;

                        byte[] key = RedisKeyUtil.binanceTicker(symbol).getBytes();

                        String last = node.get("c").asText();
                        String open = node.get("o").asText();
                        String vol = node.get("q").asText();

                        double lastDouble = Double.parseDouble(last);
                        double openDouble = Double.parseDouble(open);
                        double pct = (lastDouble - openDouble) / openDouble * 100;

                        connection.hSet(key, "last".getBytes(), last.getBytes());
                        connection.hSet(key, "open".getBytes(), open.getBytes());
                        connection.hSet(key, "volume".getBytes(), vol.getBytes());
                        connection.hSet(
                                key,
                                "priceChangePct".getBytes(),
                                String.valueOf(pct).getBytes());

                        connection.expire(key, Duration.ofMinutes(5));

                        byte[] priceKey = RedisKeyUtil.leaderboard("price").getBytes();
                        connection.zAdd(priceKey, lastDouble, symbol.getBytes());
                        connection.expire(priceKey, Duration.ofMinutes(5));

                        byte[] priceChangeKey =
                                RedisKeyUtil.leaderboard("price-change").getBytes();
                        connection.zAdd(priceChangeKey, pct, symbol.getBytes());
                        connection.expire(priceChangeKey, Duration.ofMinutes(5));
                    }

                    return null;
                });
            } catch (Exception exception) {
                log.error("Error processing Binance ticker", exception);
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            log.warn("Binance connection closed: {}", status);
            scheduleReconnect();
        }
    }

    @PreDestroy
    public void cleanup() {
        scheduledExecutorService.shutdown();
    }
}
