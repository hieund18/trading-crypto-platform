package com.hieu.coin_service.repository;

import java.util.List;
import java.util.Optional;

import com.hieu.coin_service.entity.MarketChart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketChartRepository extends MongoRepository<MarketChart, String> {

    Optional<MarketChart> findFirstBySymbolAndIntervalOrderByOpenTimeDesc(String symbol, String interval);

    List<MarketChart> findBySymbolAndIntervalAndOpenTimeBetweenOrderByOpenTimeAsc(
            String symbol, String interval, long from, long to);
}
