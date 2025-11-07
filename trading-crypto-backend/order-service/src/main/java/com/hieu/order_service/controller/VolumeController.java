package com.hieu.order_service.controller;

import com.hieu.order_service.dto.ApiResponse;
import com.hieu.order_service.dto.response.CoinVolumeRankingResponse;
import com.hieu.order_service.dto.response.TradeVolumeByTimeResponse;
import com.hieu.order_service.dto.response.UserVolumeRankingResponse;
import com.hieu.order_service.service.VolumeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/volume")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VolumeController {
    VolumeService volumeService;

    @GetMapping("/ranking/users")
    ApiResponse<List<UserVolumeRankingResponse>> getUserVolumeRanking(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return ApiResponse.<List<UserVolumeRankingResponse>>builder()
                .result(volumeService.getUserVolumeRanking(from, to))
                .build();
    }

    @GetMapping("/ranking/coins")
    ApiResponse<List<CoinVolumeRankingResponse>> getCoinVolumeRanking(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return ApiResponse.<List<CoinVolumeRankingResponse>>builder()
                .result(volumeService.getCoinVolumeRanking(from, to))
                .build();
    }

    @GetMapping("/chart")
    ApiResponse<List<TradeVolumeByTimeResponse>> getVolumeChart(
            @RequestParam String timeType,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return ApiResponse.<List<TradeVolumeByTimeResponse>>builder()
                .result(volumeService.getVolumeChart(timeType, from, to))
                .build();
    }
}
