package com.hieu.coin_service.controller;

import com.hieu.coin_service.dto.ApiResponse;
import com.hieu.coin_service.dto.PageResponse;
import com.hieu.coin_service.dto.request.AddCoinRequest;
import com.hieu.coin_service.dto.request.ConvertAmountRequest;
import com.hieu.coin_service.dto.request.ConvertQuantityRequest;
import com.hieu.coin_service.dto.response.*;
import com.hieu.coin_service.service.CoinGeckoService;
import com.hieu.coin_service.service.CoinService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CoinController {

    CoinGeckoService coinGeckoService;
    CoinService coinService;

//    @GetMapping("/markets")
//    ApiResponse<List<CoinGeckoMarketDataResponse>> getCoins(@RequestParam(value = "currency", defaultValue = "usd") String currency,
//                                                            @RequestParam(value = "page", defaultValue = "1") int page,
//                                                            @RequestParam(value = "size", defaultValue = "10") int size) {
//        return ApiResponse.<List<CoinGeckoMarketDataResponse>>builder()
//                .result(coinGeckoService.getMarketData(currency, page, size))
//                .build();
//    }
//
//    @GetMapping("/{id}/market-chart")
//    ApiResponse<CoinGeckoMarketChartResponse> getMarketChart(@PathVariable String id,
//                                                             @RequestParam(value = "currency", defaultValue = "usd") String currency,
//                                                             @RequestParam(value = "days", defaultValue = "1") int days) {
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
            @PageableDefault(page = 1, sort = "marketCapRank", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<CoinResponse>>builder()
                .result(coinService.getAllCoins(pageable))
                .build();
    }

    @GetMapping("/markets/trending")
    ApiResponse<List<CoinResponse>> getTrendingCoin() {
        return ApiResponse.<List<CoinResponse>>builder()
                .result(coinService.getTrendingCoins())
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
            @RequestParam(required = false, defaultValue = "true") Boolean isActive,
            @PageableDefault(page = 1, sort = "marketCapRank", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<CoinResponse>>builder()
                .result(coinService.searchCoins(pageable, isActive, keyword))
                .build();
    }

    @PatchMapping("/markets/{id}")
    ApiResponse<CoinResponse> updateCoinStatus(@PathVariable String id) {
        return ApiResponse.<CoinResponse>builder()
                .result(coinService.updateCoinStatus(id))
                .build();
    }

    @PostMapping("/convert/amount-to-quantity")
    ApiResponse<ConvertResponse> convertAmountToQuantity(@RequestBody ConvertAmountRequest request) {
        return ApiResponse.<ConvertResponse>builder()
                .result(coinService.convertAmountToQuantity(request))
                .build();
    }

    @PostMapping("/convert/quantity-to-amount")
    ApiResponse<ConvertResponse> convertQuantityToAmount(@RequestBody ConvertQuantityRequest request) {
        return ApiResponse.<ConvertResponse>builder()
                .result(coinService.convertQuantityToAmount(request))
                .build();
    }
}
