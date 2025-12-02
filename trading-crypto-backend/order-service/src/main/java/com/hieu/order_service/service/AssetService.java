package com.hieu.order_service.service;

import com.hieu.order_service.constant.TradeType;
import com.hieu.order_service.dto.PageResponse;
import com.hieu.order_service.dto.request.AssetBuyRequest;
import com.hieu.order_service.dto.request.AssetSellRequest;
import com.hieu.order_service.dto.request.TradeRequest;
import com.hieu.order_service.dto.response.*;
import com.hieu.order_service.entity.Asset;
import com.hieu.order_service.entity.TradeHistory;
import com.hieu.order_service.exception.AppException;
import com.hieu.order_service.exception.ErrorCode;
import com.hieu.order_service.mapper.AssetMapper;
import com.hieu.order_service.mapper.TradeHistoryMapper;
import com.hieu.order_service.repository.AssetRepository;
import com.hieu.order_service.repository.TradeHistoryRepository;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AssetService {
    AssetRepository assetRepository;
    TradeHistoryRepository tradeHistoryRepository;

    AssetMapper assetMapper;
    TradeHistoryMapper tradeHistoryMapper;

    CoinService coinService;
    WalletService walletService;

    @Transactional
    public void buyAsset(AssetBuyRequest request) {
        CoinResponse coinResponse = null;
        try {
            coinResponse = coinService.getCoin(request.getCoinId()).getResult();
            if (Boolean.FALSE.equals(coinResponse.getIsActive()))
                throw new AppException(ErrorCode.INVALID_COIN);
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_GET_COIN);
        }

        double currentPrice = coinResponse.getCurrentPrice();

        Double amount = request.getAmount();
        TradeRequest tradeRequest = TradeRequest.builder()
                .amount(BigDecimal.valueOf(amount))
                .name(coinResponse.getName())
                .build();

        try {
            walletService.buyCoin(tradeRequest);
        } catch (FeignException exception) {
            log.info("Exception ", exception);

            throw new AppException(ErrorCode.CANNOT_TRADE_WALLET);
        }

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Asset asset = assetRepository.findByUserIdAndCoinId(userId, request.getCoinId()).orElse(null);

        double quantity = amount / currentPrice;
        if (asset == null) {
            asset = assetMapper.toAsset(request);
            asset.setUserId(userId);
            asset.setBuyPrice(currentPrice);
            asset.setQuantity(quantity);
        } else {
            Double oldQuantity = asset.getQuantity();
            asset.setQuantity(oldQuantity + quantity);

            Double oldBuyPrice = asset.getBuyPrice();
            Double newAvgPrice = (oldQuantity * oldBuyPrice + quantity * currentPrice) / asset.getQuantity();
            asset.setBuyPrice(newAvgPrice);
        }
        assetRepository.save(asset);

        TradeHistory tradeHistory = tradeHistoryMapper.toTradeHistory(request);
        tradeHistory.setUserId(userId);
        tradeHistory.setType(TradeType.BUY.name());
        tradeHistory.setQuantity(quantity);
        tradeHistory.setPrice(currentPrice);
        tradeHistoryRepository.save(tradeHistory);
    }

    public PageResponse<TradeHistoryResponse> getMyTradeHistory(Pageable pageable, String type) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = tradeHistoryRepository.findAllByUserIdAndType(pageRequest, userId, type);

        return PageResponse.fromPage(pageData.map(tradeHistoryMapper::toTradeHistoryResponse));
    }

    public AssetResponse getMyAsset() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var assetList = assetRepository.findAllByUserId(userId);

        double totalCurrentAmount = 0;
        double totalBuyAmount = 0;

        List<AssetCoinResponse> assetCoinResponseList = new ArrayList<>();

        for (Asset asset : assetList) {
            AssetCoinResponse assetCoinResponse = assetMapper.toAssetCoinResponse(asset);

            var coinResponse = coinService.getCoin(asset.getCoinId()).getResult();

            assetMapper.updateAssetCoinResponse(assetCoinResponse, coinResponse);

            Double quantity = asset.getQuantity();
            Double buyAmount = quantity * asset.getBuyPrice();

            Double currentAmount = quantity * coinResponse.getCurrentPrice();
            assetCoinResponse.setCurrentAmount(currentAmount);

            Double amountChange = currentAmount - buyAmount;
            assetCoinResponse.setAmountChange(amountChange);
            assetCoinResponse.setPercentageChange(amountChange / buyAmount * 100);

            totalCurrentAmount += currentAmount;
            totalBuyAmount += buyAmount;

            assetCoinResponseList.add(assetCoinResponse);
        }

        double finalTotalAmount = totalCurrentAmount;
        assetCoinResponseList.forEach(assetCoinResponse -> {
            assetCoinResponse.setPercentageAsset(assetCoinResponse.getCurrentAmount() / finalTotalAmount * 100);
        });

        assetCoinResponseList.sort(Comparator.comparing(AssetCoinResponse::getCurrentAmount).reversed());

        double totalAmountChange = totalCurrentAmount - totalBuyAmount;
        double totalPercentageChange = totalAmountChange / totalBuyAmount * 100;

        return AssetResponse.builder()
                .totalCurrentAmount(totalCurrentAmount)
                .totalAmountChange(totalAmountChange)
                .totalPercentageChange(totalPercentageChange)
                .coins(assetCoinResponseList)
                .build();
    }

    public AvailableQuantityResponse getAvailableQuantity(String coinId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Double quantity = assetRepository.findByUserIdAndCoinId(userId, coinId)
                .map(Asset::getQuantity).orElse(0.0);

        return AvailableQuantityResponse.builder()
                .quantity(quantity)
                .build();
    }

    @Transactional
    public void sellAsset(AssetSellRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        String coinId = request.getCoinId();
        Asset asset = assetRepository.findByUserIdAndCoinId(userId, coinId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_QUANTITY));

        CoinResponse coinResponse = null;
        try {
            coinResponse = coinService.getCoin(coinId).getResult();
            if (Boolean.FALSE.equals(coinResponse.getIsActive()))
                throw new AppException(ErrorCode.INVALID_COIN);
        } catch (FeignException exception) {
            throw new AppException(ErrorCode.CANNOT_GET_COIN);
        }

        double currentPrice = coinResponse.getCurrentPrice();
        Double quantity = request.getQuantity();

        double oldQuantity = asset.getQuantity();
        if (quantity > oldQuantity)
            throw new AppException(ErrorCode.INVALID_QUANTITY);

        double amount = currentPrice * quantity;

        TradeRequest tradeRequest = TradeRequest.builder()
                .name(coinResponse.getName())
                .amount(BigDecimal.valueOf(amount))
                .build();

        try {
            walletService.sellCoin(tradeRequest);
        } catch (FeignException exception) {
            log.info("Exception ", exception);

            throw new AppException(ErrorCode.CANNOT_TRADE_WALLET);
        }

        if (quantity == oldQuantity) {
            assetRepository.delete(asset);
        } else {
            asset.setQuantity(oldQuantity - quantity);
            assetRepository.save(asset);
        }

        TradeHistory tradeHistory = tradeHistoryMapper.toTradeHistory(request);
        tradeHistory.setUserId(userId);
        tradeHistory.setType(TradeType.SELL.name());
        tradeHistory.setAmount(amount);
        tradeHistory.setPrice(currentPrice);
        tradeHistoryRepository.save(tradeHistory);
    }
}
