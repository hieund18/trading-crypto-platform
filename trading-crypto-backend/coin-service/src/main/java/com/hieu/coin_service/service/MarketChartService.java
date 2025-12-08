package com.hieu.coin_service.service;

import java.util.List;
import java.util.Objects;

import com.hieu.coin_service.dto.response.MarketChartResponse;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.entity.MarketChart;
import com.hieu.coin_service.exception.AppException;
import com.hieu.coin_service.exception.ErrorCode;
import com.hieu.coin_service.mapper.MarketChartMapper;
import com.hieu.coin_service.repository.CoinRepository;
import com.hieu.coin_service.repository.MarketChartRepository;
import com.hieu.coin_service.repository.httpclient.BinanceClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MarketChartService {
    MarketChartRepository marketChartRepository;
    CoinRepository coinRepository;

    MarketChartMapper marketChartMapper;

    BinanceClient binanceClient;

    @NonFinal
    private List<String> intervals = List.of("5m", "15m", "1h", "1d", "1w");

    @NonFinal
    protected int MAX_LIMIT = 1000;

    public List<MarketChartResponse> getMarketChart(
            String coinId, String interval, Long startTime, Long endTime, int limit) {
        Coin coin = coinRepository.findById(coinId).orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        String binanceSymbol = coin.getBinanceSymbol();

        if (limit > MAX_LIMIT) throw new AppException(ErrorCode.INVALID_LIMIT);

        if (!intervals.contains(interval)) throw new AppException(ErrorCode.INVALID_INTERVAL);

        long now = System.currentTimeMillis();
        if (endTime == null) endTime = now;

        if (startTime == null) startTime = endTime - (limit * getDurationMillis(interval));

        List<MarketChart> marketCharts =
                marketChartRepository.findBySymbolAndIntervalAndOpenTimeBetweenOrderByOpenTimeAsc(
                        binanceSymbol, interval, startTime, endTime);

        if (marketCharts.size() > limit)
            marketCharts = marketCharts.subList(marketCharts.size() - limit, marketCharts.size());

        return marketCharts.stream()
                .map(marketChartMapper::toMarketChartResponse)
                .toList();
    }

    public void initMarketChart() {
        if (marketChartRepository.count() > 0) return;

        for (String interval : intervals) {
            syncIntervalBatch(interval);
        }

        log.info("Init market chart complete");
    }

    public void initMarketChartBySymbol(String symbol) {
        if (!coinRepository.existsByBinanceSymbol(symbol)) return;

        for (String interval : intervals) {
            try {
                syncKline(symbol, interval);
            } catch (Exception exception) {
                log.error("Failed to sync chart for {} interval {}", symbol, interval, exception);
            }
        }

        log.info("Sync interval for {} coin complete", symbol);
    }

    public void syncIntervalBatch(String interval) {
        var binanceSymbols = coinRepository.findByIsActiveTrue().stream()
                .map(Coin::getBinanceSymbol)
                .filter(Objects::nonNull)
                .toList();

        for (String symbol : binanceSymbols) {
            try {
                syncKline(symbol, interval);
            } catch (Exception exception) {
                log.error("Failed to sync chart for {} interval {}", symbol, interval, exception);
            }
        }

        log.info("Sync interval {} for {} coins complete", interval, binanceSymbols.size());
    }

    public void syncKline(String symbol, String interval) {
        var lastCandle = marketChartRepository.findFirstBySymbolAndIntervalOrderByOpenTimeDesc(symbol, interval);

        Long startTime =
                lastCandle.map(marketChart -> marketChart.getOpenTime() + 1).orElse(null);

        var klines = binanceClient.getKlines(symbol, interval, 1000, startTime, null);

        if (CollectionUtils.isEmpty(klines)) return;

        List<Object> last = klines.get(klines.size() - 1);
        long closeTime = ((Number) last.get(6)).longValue();
        long currentTime = System.currentTimeMillis();
        if (closeTime > currentTime) {
            klines.remove(klines.size() - 1);
        }

        if (CollectionUtils.isEmpty(klines)) return;

        List<MarketChart> marketCharts = klines.stream()
                .map(objects -> toMarketChart(symbol, interval, objects))
                .toList();

        marketChartRepository.saveAll(marketCharts);
    }

    private MarketChart toMarketChart(String symbol, String interval, List<Object> response) {
        long openTime = ((Number) response.get(0)).longValue();

        return MarketChart.builder()
                .id(symbol + "_" + interval + "_" + openTime)
                .symbol(symbol)
                .interval(interval)
                .openTime(openTime)
                .openPrice(Double.parseDouble(response.get(1).toString()))
                .highPrice(Double.parseDouble(response.get(2).toString()))
                .lowPrice(Double.parseDouble(response.get(3).toString()))
                .closePrice(Double.parseDouble(response.get(4).toString()))
                .volume(Double.parseDouble(response.get(5).toString()))
                .closeTime(((Number) response.get(6)).longValue())
                .build();
    }

    private long getDurationMillis(String interval) {
        if (interval == null) return 0;

        return switch (interval) {
            case "5m" -> 5 * 60 * 1000L;
            case "15m" -> 15 * 60 * 1000L;
            case "1h" -> 60 * 60 * 1000L;
            case "1d" -> 24 * 60 * 60 * 1000L;
            case "1w" -> 7 * 24 * 60 * 60 * 1000L;
            default -> throw new AppException(ErrorCode.INVALID_INTERVAL);
        };
    }
}
