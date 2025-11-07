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

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VolumeService {
    TradeHistoryRepository tradeHistoryRepository;

    public List<UserVolumeRankingResponse> getUserVolumeRanking(LocalDate from, LocalDate to) {
        Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<UserVolumeRankingResponse> list = tradeHistoryRepository.getUserRanking(start, end);

        return list;
    }

    public List<CoinVolumeRankingResponse> getCoinVolumeRanking(LocalDate from, LocalDate to) {
        Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<CoinVolumeRankingResponse> list = tradeHistoryRepository.getCoinRanking(start, end);

        return list;
    }

    public List<TradeVolumeByTimeResponse> getVolumeChart(String typeTime, LocalDate from, LocalDate to) {
        Instant start = from.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant end = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<TradeVolumeByTimeResponse> dbList;
        switch (typeTime.toUpperCase()) {
            case "HOUR" -> dbList = map(tradeHistoryRepository.volumeByHour(start, end));
            case "DAY" -> dbList = map(tradeHistoryRepository.volumeByDay(start, end));
            case "MONTH" -> dbList = map(tradeHistoryRepository.volumeByMonth(start, end));
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
            LocalDate from, LocalDate to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();

        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00");

        LocalDateTime cur = start;
        while (cur.isBefore(end)) {
            String key = cur.format(formatter);

            result.add(
                    map.getOrDefault(
                            key,
                            TradeVolumeByTimeResponse.builder()
                                    .period(key)
                                    .totalVolume(0.0)
                                    .transactionCount(0L)
                                    .build()
                    )
            );
            cur = cur.plusHours(1);
        }
        return result;
    }

    public List<TradeVolumeByTimeResponse> fillDay(
            LocalDate from, LocalDate to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();

        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            String key = cur.toString();
            result.add(
                    map.getOrDefault(
                            key,
                            TradeVolumeByTimeResponse.builder()
                                    .period(key)
                                    .totalVolume(0.0)
                                    .transactionCount(0L)
                                    .build()
                    )
            );
            cur = cur.plusDays(1);
        }
        return result;
    }

    public List<TradeVolumeByTimeResponse> fillMonth(
            LocalDate from, LocalDate to, Map<String, TradeVolumeByTimeResponse> map
    ) {
        List<TradeVolumeByTimeResponse> result = new ArrayList<>();

        LocalDate cur = LocalDate.of(from.getYear(), from.getMonth(), 1);
        LocalDate end = LocalDate.of(to.getYear(), to.getMonth(), 1);

        while (!cur.isAfter(end)) {
            String key = cur.format(DateTimeFormatter.ofPattern("yyyy-MM"));

            result.add(
                    map.getOrDefault(
                            key,
                            TradeVolumeByTimeResponse.builder()
                                    .period(key)
                                    .totalVolume(0.0)
                                    .transactionCount(0L)
                                    .build()
                    )
            );
            cur = cur.plusMonths(1);
        }
        return result;
    }

}
