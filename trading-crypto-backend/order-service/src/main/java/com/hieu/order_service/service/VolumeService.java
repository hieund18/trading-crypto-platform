package com.hieu.order_service.service;

import ch.qos.logback.classic.spi.IThrowableProxy;
import com.hieu.order_service.dto.response.CoinVolumeRankingResponse;
import com.hieu.order_service.dto.response.TradeVolumeByTimeResponse;
import com.hieu.order_service.dto.response.UserVolumeRankingResponse;
import com.hieu.order_service.exception.AppException;
import com.hieu.order_service.exception.ErrorCode;
import com.hieu.order_service.repository.TradeHistoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VolumeService {
    TradeHistoryRepository tradeHistoryRepository;

    public List<UserVolumeRankingResponse> getUserVolumeRanking(Instant from, Instant to) {
        return tradeHistoryRepository.getUserRanking(from, to);
    }

    public List<CoinVolumeRankingResponse> getCoinVolumeRanking(Instant from, Instant to) {
        return tradeHistoryRepository.getCoinRanking(from, to);
    }

    public List<TradeVolumeByTimeResponse> getVolumeChart(String typeTime, Instant from, Instant to) {
        List<TradeVolumeByTimeResponse> dbList;
        switch (typeTime.toUpperCase()) {
            case "HOUR" -> dbList = map(tradeHistoryRepository.volumeByHour(from, to));
            case "DAY" -> dbList = map(tradeHistoryRepository.volumeByDay(from, to));
            case "MONTH" -> dbList = map(tradeHistoryRepository.volumeByMonth(from, to));
            default -> throw new AppException(ErrorCode.INVALID_TIME_TYPE);
        }
        ;

        Map<String, TradeVolumeByTimeResponse> map = dbList.stream()
                .collect(Collectors.toMap(TradeVolumeByTimeResponse::getPeriod, v -> v));

        return switch (typeTime.toUpperCase()) {
            case "HOUR" -> fillHour(from, to, map);
            case "DAY" -> fillDay(from, to, map);
            case "MONTH" -> fillMonth(from, to, map);
            default -> throw new AppException(ErrorCode.INVALID_TIME_TYPE);
        };
    }

    private List<TradeVolumeByTimeResponse> map(List<Object[]> rows) {
        List<TradeVolumeByTimeResponse> list = new ArrayList<>();
        for (Object[] r : rows) {
            list.add(new TradeVolumeByTimeResponse(
                    (String) r[0],
                    r[1] == null ? 0.0 : ((Number) r[1]).doubleValue(),
                    r[2] == null ? 0L : ((Number) r[2]).longValue()
            ));
        }
        return list;
    }

    public List<TradeVolumeByTimeResponse> fillHour(
            Instant from, Instant to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00");

        // Chuyển sang ZonedDateTime UTC để tính toán cộng giờ chính xác
        ZonedDateTime current = from.atZone(ZoneOffset.UTC).truncatedTo(ChronoUnit.HOURS);
        ZonedDateTime end = to.atZone(ZoneOffset.UTC);

        while (current.isBefore(end)) {
            String key = current.format(formatter);
            result.add(map.getOrDefault(key, createEmpty(key)));
            current = current.plusHours(1);
        }
        return result;
    }

    public List<TradeVolumeByTimeResponse> fillDay(
            Instant from, Instant to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        ZonedDateTime current = from.atZone(ZoneOffset.UTC).truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime end = to.atZone(ZoneOffset.UTC);

        while (current.isBefore(end)) {
            String key = current.format(formatter);
            result.add(map.getOrDefault(key, createEmpty(key)));
            current = current.plusDays(1);
        }
        return result;
    }

    public List<TradeVolumeByTimeResponse> fillMonth(
            Instant from, Instant to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        // Đưa về ngày đầu tháng để lặp cho đúng
        ZonedDateTime current = from.atZone(ZoneOffset.UTC).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        ZonedDateTime end = to.atZone(ZoneOffset.UTC);

        // Lặp cho đến khi vượt qua thời gian kết thúc
        // (Hoặc dùng !current.isAfter(end) nếu muốn bao gồm cả tháng cuối cùng trọn vẹn)
        while (current.isBefore(end)) {
            String key = current.format(formatter);
            result.add(map.getOrDefault(key, createEmpty(key)));
            current = current.plusMonths(1);
        }
        return result;
    }

    private TradeVolumeByTimeResponse createEmpty(String period) {
        return TradeVolumeByTimeResponse.builder()
                .period(period)
                .totalVolume(0.0)
                .transactionCount(0L)
                .build();
    }
}
