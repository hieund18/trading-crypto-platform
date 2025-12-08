package com.hieu.coin_service.controller;

import com.hieu.coin_service.dto.ApiResponse;
import com.hieu.coin_service.dto.PageResponse;
import com.hieu.coin_service.dto.request.AddCoinRequest;
import com.hieu.coin_service.dto.request.ConvertAmountRequest;
import com.hieu.coin_service.dto.request.ConvertQuantityRequest;
import com.hieu.coin_service.dto.request.UpdateBinanceSymbolRequest;
import com.hieu.coin_service.dto.response.*;
import com.hieu.coin_service.entity.BinanceSymbolMaster;
import com.hieu.coin_service.entity.CoinGeckoMaster;
import com.hieu.coin_service.service.CoinGeckoService;
import com.hieu.coin_service.service.CoinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CoinController {

    CoinGeckoService coinGeckoService;
    CoinService coinService;

    //    @GetMapping("/markets")
    //    ApiResponse<List<CoinGeckoMarketDataResponse>> getCoins(@RequestParam(value = "currency", defaultValue =
    // "usd") String currency,
    //                                                            @RequestParam(value = "page", defaultValue = "1") int
    // page,
    //                                                            @RequestParam(value = "size", defaultValue = "10") int
    // size) {
    //        return ApiResponse.<List<CoinGeckoMarketDataResponse>>builder()
    //                .result(coinGeckoService.getMarketData(currency, page, size))
    //                .build();
    //    }
    //
    //    @GetMapping("/{id}/market-chart")
    //    ApiResponse<CoinGeckoMarketChartResponse> getMarketChart(@PathVariable String id,
    //                                                             @RequestParam(value = "currency", defaultValue =
    // "usd") String currency,
    //                                                             @RequestParam(value = "days", defaultValue = "1") int
    // days) {
    //        return ApiResponse.<CoinGeckoMarketChartResponse>builder()
    //                .result(coinGeckoService.getMarketChart(currency, id, days))
    //                .build();
    //    }

    @PostMapping("/markets")
    ApiResponse<CoinResponse> addCoin(@RequestBody AddCoinRequest request) {
        return ApiResponse.<CoinResponse>builder()
                .result(coinService.addCoin(request))
                .build();
    }

    @GetMapping("/markets")
    ApiResponse<PageResponse<CoinResponse>> getAllCoins(
            @PageableDefault(page = 1, sort = "marketCapRank", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<CoinResponse>>builder()
                .result(coinService.getAllCoins(pageable))
                .build();
    }

    @GetMapping("/markets/trending")
    ApiResponse<PageResponse<CoinResponse>> getTrendingCoin(
            @PageableDefault(page = 1, sort = "trendingRank", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<CoinResponse>>builder()
                .result(coinService.getTrendingCoins(pageable))
                .build();
    }

    @GetMapping("/markets/{id}")
    ApiResponse<CoinResponse> getCoin(@PathVariable String id) {
        return ApiResponse.<CoinResponse>builder()
                .result(coinService.getCoin(id))
                .build();
    }

    @GetMapping("/markets/search")
    ApiResponse<PageResponse<CoinResponse>> searchCoins(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) Boolean isActive,
            @PageableDefault(page = 1, sort = "marketCapRank", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<CoinResponse>>builder()
                .result(coinService.searchCoins(pageable, isActive, keyword))
                .build();
    }

    @PatchMapping("/markets/status/{id}")
    ApiResponse<CoinResponse> updateCoinStatus(@PathVariable String id) {
        return ApiResponse.<CoinResponse>builder()
                .result(coinService.updateCoinStatus(id))
                .build();
    }

    @PutMapping("/markets/binance-symbol/{id}")
    ApiResponse<CoinResponse> updateBinanceSymbol(
            @PathVariable String id, @RequestBody UpdateBinanceSymbolRequest request) {
        return ApiResponse.<CoinResponse>builder()
                .result(coinService.updateBinanceSymbol(id, request))
                .build();
    }

    @PostMapping("/markets/convert/amount-to-quantity")
    ApiResponse<ConvertResponse> convertAmountToQuantity(@RequestBody ConvertAmountRequest request) {
        return ApiResponse.<ConvertResponse>builder()
                .result(coinService.convertAmountToQuantity(request))
                .build();
    }

    @PostMapping("/markets/convert/quantity-to-amount")
    ApiResponse<ConvertResponse> convertQuantityToAmount(@RequestBody ConvertQuantityRequest request) {
        return ApiResponse.<ConvertResponse>builder()
                .result(coinService.convertQuantityToAmount(request))
                .build();
    }

    @GetMapping("/master/coingecko/search")
    ApiResponse<PageResponse<CoinGeckoMaster>> searchCoinGeckoMaster(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @PageableDefault(page = 1, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<CoinGeckoMaster>>builder()
                .result(coinService.searchCoinGeckoMaster(pageable, keyword))
                .build();
    }

    @GetMapping("/master/binance-symbol/search")
    ApiResponse<PageResponse<BinanceSymbolMaster>> searchBinanceSymbolMaster(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @PageableDefault(page = 1, sort = "symbol", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<BinanceSymbolMaster>>builder()
                .result(coinService.searchBinanceSymbolMaster(pageable, keyword))
                .build();
    }
}
