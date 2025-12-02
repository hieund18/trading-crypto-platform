package com.hieu.coin_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.coin_service.dto.CoinUpdateEvent;
import com.hieu.coin_service.dto.PageResponse;
import com.hieu.coin_service.dto.request.AddCoinRequest;
import com.hieu.coin_service.dto.request.ConvertAmountRequest;
import com.hieu.coin_service.dto.request.ConvertQuantityRequest;
import com.hieu.coin_service.dto.request.UpdateBinanceSymbolRequest;
import com.hieu.coin_service.dto.response.CoinGeckoMarketDataResponse;
import com.hieu.coin_service.dto.response.CoinResponse;
import com.hieu.coin_service.dto.response.ConvertResponse;
import com.hieu.coin_service.dto.response.TickerResponse;
import com.hieu.coin_service.entity.BinanceSymbolMaster;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.entity.CoinGeckoMaster;
import com.hieu.coin_service.exception.AppException;
import com.hieu.coin_service.exception.ErrorCode;
import com.hieu.coin_service.mapper.CoinMapper;
import com.hieu.coin_service.repository.BinanceSymbolMasterRepository;
import com.hieu.coin_service.repository.CoinGeckoMasterRepository;
import com.hieu.coin_service.repository.CoinRepository;
import com.hieu.coin_service.util.RedisKeyUtil;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CoinService {
    CoinGeckoService coinGeckoService;
    BinanceService binanceService;
    CoinRepository coinRepository;
    CoinGeckoMasterRepository coinGeckoMasterRepository;
    BinanceSymbolMasterRepository binanceSymbolMasterRepository;

    CoinMapper coinMapper;

    RedisTemplate<String, Object> redisTemplate;
    ObjectMapper objectMapper;
    SimpMessagingTemplate messagingTemplate;
    KafkaTemplate<String, Object> kafkaTemplate;

    BinanceTickerListener binanceTickerListener;

    @NonFinal
    List<String> activeSymbols = new ArrayList<>();

    public CoinResponse addCoin(AddCoinRequest request) {

        var coinGeckoMarketDataResponses = coinGeckoService.getCoinData("usd", request.getId());
        if (CollectionUtils.isEmpty(coinGeckoMarketDataResponses))
            throw new AppException(ErrorCode.INVALID_COIN);

        Coin coin = coinMapper.toCoin(coinGeckoMarketDataResponses.get(0));
        coin.setCreatedAt(Instant.now());

        String predictedSymbol = coin.getSymbol().toUpperCase() + "USDT";
        if (binanceSymbolMasterRepository.existsById(predictedSymbol)
                && !coinRepository.existsByBinanceSymbol(predictedSymbol)) {
            coin.setBinanceSymbol(predictedSymbol);
            coin.setIsActive(true);
        } else {
            coin.setBinanceSymbol(null);
            coin.setIsActive(false);
            log.warn("Please set up binance symbol: {}", coin.getName());
        }

        try {
            coinRepository.insert(coin);
        } catch (DuplicateKeyException exception) {
            throw new AppException(ErrorCode.COIN_EXISTED);
        }

        CoinUpdateEvent coinUpdateEvent = CoinUpdateEvent.builder()
                .type("UPDATE_FILTER")
                .coinId(coin.getId())
                .build();

        kafkaTemplate.send("coin-update", coinUpdateEvent);

        var coinResponse = coinMapper.toCoinResponse(coin);

        return coinResponse;
    }

    public PageResponse<CoinResponse> getAllCoins(Pageable pageable) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());
        var pageData = coinRepository.findAll(pageRequest);

        var response = pageData.getContent().stream().map(coinMapper::toCoinResponse).toList();

        List<String> binanceSymbols = response.stream().map(CoinResponse::getBinanceSymbol)
                .filter(Objects::nonNull).toList();

        Map<String, TickerResponse> tickerMap = getTickersFromRedis(binanceSymbols);

        response.forEach(coinResponse -> {
            if (coinResponse.getBinanceSymbol() != null)
                coinMapper.updateCoinResponse(coinResponse, tickerMap.get(coinResponse.getBinanceSymbol()));
        });

        var pageResponse = PageResponse.<CoinResponse>builder()
                .currentPage(pageable.getPageNumber())
                .sizePage(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .content(response)
                .build();

        return pageResponse;
    }

    public PageResponse<CoinResponse> getTrendingCoins(Pageable pageable) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());
        var pageData = coinRepository.findByTrendingRankNotNullAndIsActiveTrue(pageRequest);

        var response = pageData.getContent().stream().map(coinMapper::toCoinResponse).toList();

        List<String> binanceSymbols = response.stream().map(CoinResponse::getBinanceSymbol)
                .filter(Objects::nonNull).toList();

        Map<String, TickerResponse> tickerMap = getTickersFromRedis(binanceSymbols);

        response.forEach(coinResponse -> {
            if (coinResponse.getBinanceSymbol() != null)
                coinMapper.updateCoinResponse(coinResponse, tickerMap.get(coinResponse.getBinanceSymbol()));
        });

        var pageResponse = PageResponse.<CoinResponse>builder()
                .currentPage(pageable.getPageNumber())
                .sizePage(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .content(response)
                .build();

        return pageResponse;
    }

    public CoinResponse getCoin(String id) {
        Coin coin = coinRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        var coinResponse = coinMapper.toCoinResponse(coin);

        String binanceSymbol = coin.getBinanceSymbol();
        if (binanceSymbol == null)
            return coinResponse;

        TickerResponse tickerResponse = getTicketFromRedis(binanceSymbol);
        if (tickerResponse != null)
            coinMapper.updateCoinResponse(coinResponse, tickerResponse);

        return coinResponse;
    }

    public PageResponse<CoinResponse> searchCoins(Pageable pageable, Boolean isActive, String keyword) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        String sortProperty = "";
        if (!pageable.getSort().isEmpty()) {
            sortProperty = pageable.getSort().iterator().next().getProperty();
        }

        boolean isRealtimeSort = "currentPrice".equals(sortProperty) || "priceChangePercentage24h".equals(sortProperty);
        if (isRealtimeSort && !StringUtils.hasText(keyword)) {
            String keyType = "currentPrice".equals(sortProperty) ? "price" : "price-change";
            var response = getCoinsFromLeaderboard(pageRequest, keyType, sortProperty);
            if (response != null)
                return response;
        }

        Page<Coin> coinPage = coinRepository.search(keyword, isActive, pageRequest);

        var response = coinPage.getContent().stream().map(coinMapper::toCoinResponse).toList();
        List<String> binanceSymbols = response.stream().map(CoinResponse::getBinanceSymbol)
                .filter(Objects::nonNull).toList();
        Map<String, TickerResponse> tickerMap = getTickersFromRedis(binanceSymbols);

        response.forEach(coinResponse -> {
            if (coinResponse.getBinanceSymbol() != null)
                coinMapper.updateCoinResponse(coinResponse, tickerMap.get(coinResponse.getBinanceSymbol()));
        });

        PageResponse<CoinResponse> pageResponse = PageResponse.<CoinResponse>builder()
                .currentPage(pageable.getPageNumber())
                .totalPages(coinPage.getTotalPages())
                .sizePage(pageable.getPageSize())
                .totalElements(coinPage.getTotalElements())
                .content(response)
                .build();

        return pageResponse;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CoinResponse updateCoinStatus(String id) {
        Coin coin = coinRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        coin.setIsActive(!coin.getIsActive());
        coinRepository.save(coin);

        CoinUpdateEvent coinUpdateEvent = CoinUpdateEvent.builder()
                .type("UPDATE_FILTER")
                .coinId(coin.getId())
                .build();

        kafkaTemplate.send("coin-update", coinUpdateEvent);

        return coinMapper.toCoinResponse(coin);
    }

    public CoinResponse updateBinanceSymbol(String id, UpdateBinanceSymbolRequest request) {
        Coin coin = coinRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        String binanceSymbol = request.getBinanceSymbol();

        if (StringUtils.hasText(binanceSymbol) && !binanceSymbolMasterRepository.existsById(binanceSymbol))
            throw new AppException(ErrorCode.INVALID_SYMBOL);

        coin.setBinanceSymbol(binanceSymbol);

        try{
            coinRepository.save(coin);
        }catch (DuplicateKeyException exception){
            throw new AppException(ErrorCode.BINANCE_SYMBOL_EXISTED);
        }

        CoinUpdateEvent coinUpdateEvent = CoinUpdateEvent.builder()
                .type("UPDATE_FILTER")
                .coinId(coin.getId())
                .build();

        kafkaTemplate.send("coin-update", coinUpdateEvent);

        return coinMapper.toCoinResponse(coin);
    }

    public ConvertResponse convertAmountToQuantity(ConvertAmountRequest request) {
        Coin coin = coinRepository.findById(request.getCoinId())
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        Double currentPrice = coin.getCurrentPrice();

        if(StringUtils.hasText(coin.getBinanceSymbol())){
            TickerResponse tickerResponse = getTicketFromRedis(coin.getBinanceSymbol());

            if(tickerResponse != null && tickerResponse.getCurrentPrice() != null)
                currentPrice = tickerResponse.getCurrentPrice();
        }

        if(currentPrice == null || currentPrice == 0)
            throw new AppException(ErrorCode.INVALID_PRICE);

        ConvertResponse convertResponse = coinMapper.toConvertResponse(request);
        convertResponse.setPrice(currentPrice);
        convertResponse.setQuantity(formatDouble(request.getAmount() / currentPrice));

        return convertResponse;
    }

    public ConvertResponse convertQuantityToAmount(ConvertQuantityRequest request) {
        Coin coin = coinRepository.findById(request.getCoinId())
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        Double currentPrice = coin.getCurrentPrice();

        if(StringUtils.hasText(coin.getBinanceSymbol())){
            TickerResponse tickerResponse = getTicketFromRedis(coin.getBinanceSymbol());

            if(tickerResponse != null && tickerResponse.getCurrentPrice() != null)
                currentPrice = tickerResponse.getCurrentPrice();
        }

        if(currentPrice == null || currentPrice == 0)
            throw new AppException(ErrorCode.INVALID_PRICE);

        ConvertResponse convertResponse = coinMapper.toConvertResponse(request);
        convertResponse.setPrice(currentPrice);
        convertResponse.setAmount(formatDouble(request.getQuantity() * currentPrice));

        return convertResponse;
    }

    public PageResponse<CoinGeckoMaster> searchCoinGeckoMaster(Pageable pageable, String keyword) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = coinGeckoMasterRepository.findAllByNameContainingIgnoreCaseOrSymbolContainingIgnoreCase(keyword, keyword, pageRequest);

        return PageResponse.fromPage(pageData);
    }

    public PageResponse<BinanceSymbolMaster> searchBinanceSymbolMaster(Pageable pageable, String keyword) {
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = binanceSymbolMasterRepository.findBySymbolContainingIgnoreCase(pageRequest, keyword);

        return PageResponse.fromPage(pageData);
    }

    @Scheduled(fixedRate = 1000 * 60)
    public void refreshSupportedSymbols() {
        activeSymbols = coinRepository.findByIsActiveTrue().stream()
                .map(Coin::getBinanceSymbol).filter(Objects::nonNull).toList();
    }

    @Scheduled(fixedRate = 1000)
    public void broadcastTicker() {
        if (activeSymbols.isEmpty())
            return;

        Map<String, TickerResponse> tickerMap = getTickersFromRedis(activeSymbols);

        List<TickerResponse> lisToSend = new ArrayList<>();

        for (String symbol : activeSymbols) {
            TickerResponse tickerResponse = tickerMap.get(symbol);
            if (tickerResponse != null) {
                messagingTemplate.convertAndSend("/topic/ticker/" + symbol, tickerResponse);
                lisToSend.add(tickerResponse);
            }
        }

        if (!lisToSend.isEmpty())
            messagingTemplate.convertAndSend("/topic/tickers", lisToSend);
    }

    public void syncCoinGeckoMaster() {
        try {
            var responseList = coinGeckoService.getAllCoins();
            if (CollectionUtils.isEmpty(responseList)) {
                log.warn("CoinGecko master list is empty");
                return;
            }

            coinGeckoMasterRepository.deleteAll();
            var listCoins = responseList.stream().map(coinMapper::toCoinGeckoMaster).toList();
            coinGeckoMasterRepository.saveAll(listCoins);
            log.info("Sync {} records", listCoins.size());
        } catch (FeignException exception) {
            log.warn("Error syncing CoinGecko master", exception);
        }
    }

    public void syncBinanceSymbolMaster() {
        try {
            var binanceExchangeInfoResponse = binanceService.getCoinSymbol();
            if (binanceExchangeInfoResponse == null || binanceExchangeInfoResponse.getSymbols() == null) {
                log.warn("Binance master list is empty");
                return;
            }

            binanceSymbolMasterRepository.deleteAll();
            var listBinanceSymbolMaster = binanceExchangeInfoResponse.getSymbols()
                    .stream().filter(binanceSymbol -> "TRADING".equalsIgnoreCase(binanceSymbol.getStatus()))
                    .map(coinMapper::toBinanceSymbolMaster).toList();
            binanceSymbolMasterRepository.saveAll(listBinanceSymbolMaster);
            log.info("Sync {} records", listBinanceSymbolMaster.size());
        } catch (FeignException exception) {
            log.error("Error syncing CoinGecko master", exception);
        }
    }

    public void syncTrendingCoin() {
        try {
            var trendingResponse = coinGeckoService.getTrendingCoin();
            if (ObjectUtils.isEmpty(trendingResponse))
                return;

            List<String> trendingIds = trendingResponse.getCoins().stream()
                    .map(trendingCoin -> trendingCoin.getItem().getId())
                    .toList();

            List<Coin> oldTrending = coinRepository.findByTrendingRankNotNull();
            oldTrending.forEach(coin -> coin.setTrendingRank(null));
            coinRepository.saveAll(oldTrending);

            List<Coin> newTrendingCoins = coinRepository.findByIdIn(trendingIds);

            for (Coin coin : newTrendingCoins) {
                int rank = trendingIds.indexOf(coin.getId()) + 1;
                coin.setTrendingRank(rank);
            }

            coinRepository.saveAll(newTrendingCoins);
            log.info("Synced {} trending coins", newTrendingCoins.size());
        } catch (Exception exception) {
            log.error("Error syncing trending coins", exception);
        }
    }

    public void syncCoinData() {
        List<Coin> coins = coinRepository.findAll();
        if (coins.isEmpty()) return;

        int BATCH_SIZE = 250;
        List<List<Coin>> partitions = partitionList(coins, BATCH_SIZE);

        for (List<Coin> batch : partitions) {
            List<String> coinIds = batch.stream().map(Coin::getId).toList();
            String ids = String.join(",", coinIds);

            try {
                List<CoinGeckoMarketDataResponse> listCoinResponse = coinGeckoService.getCoinData("usd", ids);
                if (CollectionUtils.isEmpty(listCoinResponse))
                    continue;

                Map<String, CoinGeckoMarketDataResponse> mapResponse = listCoinResponse.stream()
                        .collect(Collectors.toMap(CoinGeckoMarketDataResponse::getId, Function.identity()));

                List<Coin> coinsToUpdate = new ArrayList<>();

                for (Coin coin : batch) {
                    CoinGeckoMarketDataResponse data = mapResponse.get(coin.getId());
                    if (data != null) {
                        coinMapper.updateCoin(coin, data);
                        coinsToUpdate.add(coin);
                    }
                }

                if (!coinsToUpdate.isEmpty())
                    coinRepository.saveAll(coinsToUpdate);

                Thread.sleep(1000);
            } catch (Exception exception) {
                log.error("Error syncing batch coin data", exception);
            }
        }

        log.info("Sync {} coins data complete", coins.size());
    }

    public void initCoins() {
        if (coinRepository.count() > 0) return;

        var listCoinResponse = coinGeckoService.getMarketData("usd", 1, 200);

        Set<String> binanceSymbols = new HashSet<>();

        try {
            var listBinanceCoinResponse = binanceService.getCoinSymbol();
            if (listBinanceCoinResponse != null && listBinanceCoinResponse.getSymbols() != null) {
                listBinanceCoinResponse.getSymbols().stream()
                        .filter(binanceSymbol -> "TRADING".equalsIgnoreCase(binanceSymbol.getStatus()))
                        .forEach(binanceSymbol -> binanceSymbols.add(binanceSymbol.getSymbol()));
            }
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_EXCHANGE_COIN_SYMBOL);
        }

        var listCoin = listCoinResponse.stream().map(coinMapper::toCoin).toList();
        Set<String> usedBinanceSymbol = new HashSet<>();

        listCoin.forEach(coin -> {
            coin.setCreatedAt(Instant.now());

            String predictedSymbol = coin.getSymbol().toUpperCase() + "USDT";

            if (binanceSymbols.contains(predictedSymbol) && !usedBinanceSymbol.contains(predictedSymbol)) {
                coin.setBinanceSymbol(predictedSymbol);
                coin.setIsActive(true);
                usedBinanceSymbol.add(predictedSymbol);
            } else {
                coin.setBinanceSymbol(null);
                coin.setIsActive(false);
                log.warn("Cannot find coin symbol on Binance: {}", coin.getName());
            }
        });
        coinRepository.saveAll(listCoin);

        binanceTickerListener.loadSupportedSymbols();
        log.info("Init coin data complete with Binance validation...");
    }

    private PageResponse<CoinResponse> getCoinsFromLeaderboard(Pageable pageable, String keyType, String dbSortField) {
        String redisKey = RedisKeyUtil.leaderboard(keyType);
        long start = pageable.getOffset();
        long end = start + pageable.getPageSize() - 1;

        boolean isDesc = pageable.getSort().getOrderFor(dbSortField).isDescending();

        Set<Object> symbolsObj;

        try {
            if (isDesc) {
                symbolsObj = redisTemplate.opsForZSet().reverseRange(redisKey, start, end);
            } else {
                symbolsObj = redisTemplate.opsForZSet().range(redisKey, start, end);
            }
        } catch (Exception exception) {
            log.error("Redis ZSet error, fallback to DB", exception);
            symbolsObj = Collections.emptySet();
        }

        if (CollectionUtils.isEmpty(symbolsObj))
            return null;

        List<String> symbols = symbolsObj.stream().map(Object::toString).toList();

        List<Coin> coins = coinRepository.findByBinanceSymbolInAndIsActiveTrue(symbols);

        Map<String, Coin> coinMap = coins.stream()
                .collect(Collectors.toMap(Coin::getBinanceSymbol, Function.identity(), (a, b) -> a));

        List<CoinResponse> response = new ArrayList<>();
        for (String symbol : symbols) {
            Coin coin = coinMap.get(symbol);
            if (coin != null) {
                response.add(coinMapper.toCoinResponse(coin));
            }
        }

        List<String> binanceSymbols = response.stream().map(CoinResponse::getBinanceSymbol)
                .filter(Objects::nonNull).toList();
        Map<String, TickerResponse> tickerMap = getTickersFromRedis(binanceSymbols);

        response.forEach(coinResponse -> {
            if (coinResponse.getBinanceSymbol() != null)
                coinMapper.updateCoinResponse(coinResponse, tickerMap.get(coinResponse.getBinanceSymbol()));
        });

        Long total = redisTemplate.opsForZSet().size(redisKey);

        return PageResponse.<CoinResponse>builder()
                .currentPage(pageable.getPageNumber())
                .sizePage(pageable.getPageSize())
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
                .content(response)
                .build();
    }

    private TickerResponse toTickerResponse(Map<Object, Object> map) {
        Double last = null;
        Double pct = null;
        Double vol = null;

        try {
            if (map.get("last") != null)
                last = Double.parseDouble(map.get("last").toString());
            if (map.get("priceChangePct") != null)
                pct = Double.parseDouble(map.get("priceChangePct").toString());
            if (map.get("volume") != null)
                vol = Double.parseDouble(map.get("volume").toString());
        } catch (NumberFormatException exception) {
            log.error("Error parsing ticker data", exception);
        }

        return TickerResponse.builder()
                .currentPrice(last)
                .priceChangePercentage24h(pct)
                .volume(vol)
                .build();
    }

    private TickerResponse getTicketFromRedis(String binanceSymbol) {
        if (!StringUtils.hasText(binanceSymbol))
            return null;

        String key = RedisKeyUtil.binanceTicker(binanceSymbol);
        Map<Object, Object> map = redisTemplate.opsForHash().entries(key);

        TickerResponse tickerResponse = toTickerResponse(map);
        tickerResponse.setBinanceSymbol(binanceSymbol);
        return tickerResponse;
    }

    private Map<String, TickerResponse> getTickersFromRedis(List<String> binanceSymbols) {
        if (CollectionUtils.isEmpty(binanceSymbols))
            return Collections.emptyMap();

        List<Object> results = redisTemplate.executePipelined(new SessionCallback<Object>() {
            @Override
            public Object execute(RedisOperations operations) throws DataAccessException {
                for (String symbol : binanceSymbols) {
                    String key = RedisKeyUtil.binanceTicker(symbol);
                    operations.opsForHash().entries(key);
                }
                return null;
            }
        });

        Map<String, TickerResponse> responseMap = new HashMap<>();
        for (int i = 0; i < binanceSymbols.size(); i++) {
            String symbol = binanceSymbols.get(i);
            Object result = results.get(i);
            if (result instanceof Map) {
                TickerResponse tickerResponse = toTickerResponse((Map<Object, Object>) result);
                if (tickerResponse != null) {
                    tickerResponse.setBinanceSymbol(symbol);
                    responseMap.put(symbol, tickerResponse);
                }
            }
        }

        return responseMap;
    }

    private double formatDouble(Double number) {
        return Math.round(number * 1000000.0) / 1000000.0;
    }

    private <T> List<List<T>> partitionList(List<T> list, int size) {
        List<List<T>> partitions = new ArrayList<>();

        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }

        return partitions;
    }
}
