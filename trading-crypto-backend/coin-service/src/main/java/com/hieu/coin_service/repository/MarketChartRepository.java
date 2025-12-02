package com.hieu.coin_service.repository;

import com.hieu.coin_service.entity.MarketChart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketChartRepository extends MongoRepository<MarketChart, String> {

    Optional<MarketChart> findFirstBySymbolAndIntervalOrderByOpenTimeDesc(String symbol, String interval);

    List<MarketChart> findBySymbolAndIntervalAndOpenTimeBetweenOrderByOpenTimeAsc(
            String symbol,
            String interval,
            long from,
            long to);
}
