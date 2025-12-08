package com.hieu.coin_service.controller;

import java.util.List;

import com.hieu.coin_service.dto.ApiResponse;
import com.hieu.coin_service.dto.response.MarketChartResponse;
import com.hieu.coin_service.service.MarketChartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MarketChartController {
    MarketChartService marketChartService;

    @GetMapping("/markets/charts")
    ApiResponse<List<MarketChartResponse>> getMarketChart(
            @RequestParam String id,
            @RequestParam String interval,
            @RequestParam(required = false) Long startTime,
            @RequestParam(required = false) Long endTime,
            @RequestParam(defaultValue = "1000") int limit) {
        return ApiResponse.<List<MarketChartResponse>>builder()
                .result(marketChartService.getMarketChart(id, interval, startTime, endTime, limit))
                .build();
    }
}
