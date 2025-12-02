package com.hieu.coin_service.service;

import com.hieu.coin_service.dto.response.CoinResponse;
import com.hieu.coin_service.entity.Coin;
import com.hieu.coin_service.entity.Watchlist;
import com.hieu.coin_service.exception.AppException;
import com.hieu.coin_service.exception.ErrorCode;
import com.hieu.coin_service.mapper.CoinMapper;
import com.hieu.coin_service.repository.CoinRepository;
import com.hieu.coin_service.repository.WatchlistRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WatchlistService {
    WatchlistRepository watchlistRepository;
    CoinRepository coinRepository;

    CoinMapper coinMapper;

    public CoinResponse addWatchlist(String coinId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Coin coin = coinRepository.findById(coinId)
                .orElseThrow(() -> new AppException(ErrorCode.COIN_NOT_EXISTED));

        if (Boolean.FALSE.equals(coin.getIsActive()))
            throw new AppException(ErrorCode.INVALID_COIN);

        Watchlist watchlist = Watchlist.builder()
                .userId(userId)
                .coinId(coinId)
                .build();

        watchlistRepository.save(watchlist);

        return coinMapper.toCoinResponse(coin);
    }

    public List<CoinResponse> getMyWatchlist() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var listWatchlist = watchlistRepository.findAllByUserId(userId);

        List<String> coinIds = listWatchlist.stream().map(Watchlist::getCoinId).toList();

        var listCoins = coinRepository.findByIdInAndIsActiveTrue(coinIds);

        if(!CollectionUtils.isEmpty(listCoins)){
            listCoins.sort(Comparator.comparing(Coin::getMarketCap).reversed());
        }

        return listCoins.stream().map(coinMapper::toCoinResponse).toList();
    }

    public void deleteWatchlist(String coinId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        watchlistRepository.deleteByUserIdAndCoinId(userId, coinId);
    }
}
