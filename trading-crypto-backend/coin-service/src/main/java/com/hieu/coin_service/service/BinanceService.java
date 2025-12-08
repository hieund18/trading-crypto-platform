package com.hieu.coin_service.service;

import com.hieu.coin_service.dto.response.BinanceExchangeInfoResponse;
import com.hieu.coin_service.dto.response.BinanceSymbolPriceResponse;
import com.hieu.coin_service.repository.httpclient.BinanceClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BinanceService {
    BinanceClient binanceClient;

    public BinanceExchangeInfoResponse getCoinSymbol() {
        var response = binanceClient.exchangeInfo();

        log.info("Binance coin response: {}", response);

        return response;
    }

    public BinanceSymbolPriceResponse getPrice(String symbol) {
        var response = binanceClient.getPrice(symbol);

        log.info("Binance price: {}", response);

        return response;
    }

    public boolean isSymbolSupported(String symbol) {
        try {
            var response = binanceClient.getPrice(symbol);
            return response != null;
        } catch (FeignException exception) {
            return false;
        }
    }
}
