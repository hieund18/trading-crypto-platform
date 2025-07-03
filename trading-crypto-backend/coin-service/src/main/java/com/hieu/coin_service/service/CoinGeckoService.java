package com.hieu.coin_service.service;

import com.hieu.coin_service.dto.response.CoinGeckoMarketChartResponse;
import com.hieu.coin_service.dto.response.CoinGeckoMarketDataResponse;
import com.hieu.coin_service.dto.response.TrendingCoin;
import com.hieu.coin_service.dto.response.TrendingResponse;
import com.hieu.coin_service.repository.httpclient.CoinGeckoClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CoinGeckoService {
    CoinGeckoClient coinGeckoClient;

    @NonFinal
    @Value("${outbound.market.coingecko.api-key}")
    private String apiKey;

    public List<CoinGeckoMarketDataResponse> getMarketData(String currency, int page, int size) {
        List<CoinGeckoMarketDataResponse> response = coinGeckoClient.getMarketData(apiKey, currency, size, page);

        log.info("Coin response: {}", response);
        return response;
    }

    public CoinGeckoMarketChartResponse getMarketChart(String currency, String id, int days) {

        var response = coinGeckoClient.getMarketChart(apiKey, id, currency, days);

        log.info("Market chart: {}", response);
        return response;
    }

    public List<CoinGeckoMarketDataResponse> getCoinData(String currency, String ids) {
        var response = coinGeckoClient.getCoinData(apiKey, currency, ids);
        log.info("Coin response: {}", response);

        return response;
    }

    public TrendingResponse getTrendingCoin() {
        var response = coinGeckoClient.getTrendingCoin(apiKey);
        log.info("Trending coin: {}", response);

        return response;
    }
}
