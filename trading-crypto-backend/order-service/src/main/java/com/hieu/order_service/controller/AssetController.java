package com.hieu.order_service.controller;

import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.PageResponse;
import com.hieu.order_service.dto.request.TradeAssetRequest;
import com.hieu.order_service.dto.response.AssetResponse;
import com.hieu.order_service.dto.response.AvailableQuantityResponse;
import com.hieu.order_service.dto.response.TradeHistoryResponse;
import com.hieu.order_service.service.AssetService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AssetController {
    AssetService assetService;

    @PostMapping("/buy")
    ApiResponse<Void> buyCoin(@RequestBody @Valid TradeAssetRequest request) {
        assetService.buyAsset(request);

        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/my-trade-history")
    ApiResponse<PageResponse<TradeHistoryResponse>> getMyTradeHistory(
            @PageableDefault(page = 1, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<TradeHistoryResponse>>builder()
                .result(assetService.getMyTradeHistory(pageable))
                .build();
    }

    @GetMapping("/my-portfolio")
    ApiResponse<AssetResponse> getMyAsset() {
        return ApiResponse.<AssetResponse>builder()
                .result(assetService.getMyAsset())
                .build();
    }

    @GetMapping("/available/{coinId}")
    ApiResponse<AvailableQuantityResponse> getAvailableQuantity(@PathVariable String coinId) {
        return ApiResponse.<AvailableQuantityResponse>builder()
                .result(assetService.getAvailableQuantity(coinId))
                .build();
    }

    @PostMapping("/sell")
    ApiResponse<Void> sellAsset(@RequestBody @Valid TradeAssetRequest request) {
        assetService.sellAsset(request);

        return ApiResponse.<Void>builder().build();
    }
}
