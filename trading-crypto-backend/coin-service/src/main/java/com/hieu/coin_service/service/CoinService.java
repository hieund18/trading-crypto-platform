package com.hieu.coin_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.coin_service.dto.PageResponse;
import com.hieu.coin_service.dto.request.AddCoinRequest;
import com.hieu.coin_service.dto.response.CoinGeckoMarketDataResponse;
import com.hieu.coin_service.dto.response.CoinResponse;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.exception.AppException;
import com.hieu.coin_service.exception.ErrorCode;
import com.hieu.coin_service.mapper.CoinMapper;
import com.hieu.coin_service.repository.CoinRepository;
import com.hieu.coin_service.util.RedisKeyUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Duration;
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
    CoinRepository coinRepository;

    CoinMapper coinMapper;

    RedisTemplate<String, Object> redisTemplate;
    ObjectMapper objectMapper;
    SimpMessagingTemplate messagingTemplate;

    public CoinResponse addCoin(AddCoinRequest request) {

        var coinGeckoMarketDataResponses = coinGeckoService.getCoinData("vnd", request.getId());
        if (CollectionUtils.isEmpty(coinGeckoMarketDataResponses))
            throw new AppException(ErrorCode.INVALID_COIN);

        Coin coin = coinMapper.toCoin(coinGeckoMarketDataResponses.get(0));
        coin.setCreatedAt(Instant.now());
        coin.setIsActive(true);

        try {
            coinRepository.insert(coin);
        } catch (DuplicateKeyException exception) {
            throw new AppException(ErrorCode.COIN_EXISTED);
        }

        var coinResponse = coinMapper.toCoinResponse(coin);
//        coinMapper.updateCoinResponse(coinResponse, coinGeckoMarketDataResponses.get(0));
        String key = RedisKeyUtil.coinInfo(coin.getId());
        redisTemplate.opsForValue().set(key, coinResponse, Duration.ofMinutes(1));

        return coinResponse;
    }

    public PageResponse<CoinResponse> getAllCoins(Pageable pageable) {
        String key = RedisKeyUtil.pageCoins(pageable);
        Object value = redisTemplate.opsForValue().get(key);
        PageResponse<CoinResponse> cached = objectMapper.convertValue(value, new TypeReference<PageResponse<CoinResponse>>() {});
        if(cached != null)
            return cached;

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = coinRepository.findAll(pageRequest);

        var response = pageData.getContent().stream().map(coinMapper::toCoinResponse).toList();
        var pageResponse = PageResponse.<CoinResponse>builder()
                .currentPage(pageable.getPageNumber())
                .sizePage(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .content(response)
                .build();

        redisTemplate.opsForValue().set(key, pageResponse, Duration.ofMinutes(1));

        return pageResponse;
    }

    public List<CoinResponse> getTrendingCoins() {
        String key = RedisKeyUtil.trendingCoins();
        Object value = redisTemplate.opsForValue().get(key);
        List<CoinResponse> cached = objectMapper.convertValue(value, new TypeReference<List<CoinResponse>>() {});
        if(cached != null)
            return cached;

        var trendingResponse = coinGeckoService.getTrendingCoin();

        List<String> trendingIds = new ArrayList<>();
        trendingResponse.getCoins().forEach(trendingCoin -> {
            trendingIds.add(trendingCoin.getItem().getId());
        });

        var listCoin = coinRepository.findByIdIn(trendingIds);

        Map<String, Coin> coinMap = listCoin.stream()
                .collect(Collectors.toMap(Coin::getId, Function.identity()));

        List<CoinResponse> coinResponses = trendingIds.stream()
                .map(coinMap::get)
                .filter(Objects::nonNull)
                .map(coinMapper::toCoinResponse)
                .toList();

        redisTemplate.opsForValue().set(key, coinResponses, Duration.ofMinutes(10));

        return coinResponses;
    }

    public CoinResponse getCoin(String id) {
        String key = RedisKeyUtil.coinInfo(id);
        Object value = redisTemplate.opsForValue().get(key);
        CoinResponse cacheCoin = objectMapper.convertValue(value, CoinResponse.class);
        if (Objects.nonNull(cacheCoin))
            return cacheCoin;

        Coin coin = coinRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        var coinResponse = coinMapper.toCoinResponse(coin);
//        var coinGeckoMarketDataResponses = coinGeckoService.getCoinData("vnd", id).get(0);
//        coinMapper.updateCoinResponse(coinResponse, coinGeckoMarketDataResponses);

        redisTemplate.opsForValue().set(key, coinResponse, Duration.ofMinutes(1));

        return coinResponse;
    }

    @Scheduled(fixedRate = 10000)
    public void syncCoin(){
        List<Coin> coins = coinRepository.findAll();
        List<String> coinIds = coins.stream().map(Coin::getId).collect(Collectors.toList());
        String ids = String.join(",", coinIds);
        List<CoinGeckoMarketDataResponse> listCoinResponse = coinGeckoService.getCoinData("vnd", ids);

        coins.forEach(coin -> {
            CoinGeckoMarketDataResponse coinGeckoMarketDataResponse = listCoinResponse.stream()
                    .filter(coinGeckoMarketDataResponse1 -> coinGeckoMarketDataResponse1.getId().equals(coin.getId()))
                    .findFirst().orElse(null);

            if (coinGeckoMarketDataResponse != null){
                coinMapper.updateCoin(coin, coinGeckoMarketDataResponse);
                coinRepository.save(coin);
            }

            messagingTemplate.convertAndSend("/topic/coin/" + coin.getId(), coin);
        });

        messagingTemplate.convertAndSend("/topic/coins", coins);

        Set<String> keys = redisTemplate.keys("coin-service:coin:*");
        redisTemplate.delete(keys);
    }

    public void initCoins() {
        if (coinRepository.count() > 0) return;

        var listCoinResponse = coinGeckoService.getMarketData("vnd", 1, 100);
        var listCoin = listCoinResponse.stream().map(coinMapper::toCoin).toList();

        listCoin.forEach(coin -> {
            coin.setCreatedAt(Instant.now());
            coin.setIsActive(true);
        });

        coinRepository.saveAll(listCoin);

        log.info("Init coin data complete...");
    }
}
