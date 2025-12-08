package com.hieu.coin_service.controller;

import com.hieu.coin_service.dto.CoinUpdateEvent;
import com.hieu.coin_service.service.BinanceTickerListener;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CoinUpdateController {
    BinanceTickerListener binanceTickerListener;

    @KafkaListener(topics = "coin-update", groupId = "#{T(java.util.UUID).randomUUID().toString()}")
    public void listenCoinUpdate(CoinUpdateEvent message) {
        log.info("Message: {}", message);

        binanceTickerListener.loadSupportedSymbols();
    }
}
