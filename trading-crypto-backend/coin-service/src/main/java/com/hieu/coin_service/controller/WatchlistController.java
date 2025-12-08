package com.hieu.coin_service.controller;

import java.util.List;

import com.hieu.coin_service.dto.ApiResponse;
import com.hieu.coin_service.dto.response.CoinResponse;
import com.hieu.coin_service.service.WatchlistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/watchlists")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WatchlistController {
    WatchlistService watchlistService;

    @PostMapping("/{coinId}")
    ApiResponse<CoinResponse> addWatchlist(@PathVariable String coinId) {
        return ApiResponse.<CoinResponse>builder()
                .result(watchlistService.addWatchlist(coinId))
                .build();
    }

    @GetMapping("/my-watchlist")
    ApiResponse<List<CoinResponse>> getMyWatchlist() {
        return ApiResponse.<List<CoinResponse>>builder()
                .result(watchlistService.getMyWatchlist())
                .build();
    }

    @DeleteMapping("/{coinId}")
    ApiResponse<Void> deleteWatchlist(@PathVariable String coinId) {
        watchlistService.deleteWatchlist(coinId);

        return ApiResponse.<Void>builder().build();
    }
}
