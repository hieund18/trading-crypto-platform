package com.hieu.coin_service.scheduler;

import com.hieu.coin_service.service.MarketChartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MakerChartSyncScheduler {
    MarketChartService marketChartService;

    @Scheduled(cron = "5 */5 * * * *")
    public void syncMarketChartInterval5m() {
        log.info("Start syncing interval 5m...");

        marketChartService.syncIntervalBatch("5m");

        log.info("Init market chart interval 5m complete");
    }

    @Scheduled(cron = "10 1/15 * * * *")
    public void syncMarketChartInterval15m() {
        log.info("Start syncing interval 15m...");

        marketChartService.syncIntervalBatch("15m");

        log.info("Init market chart interval 15m complete");
    }

    @Scheduled(cron = "10 2 * * * *")
    public void syncMarketChartInterval1h() {
        log.info("Start syncing interval 1h...");

        marketChartService.syncIntervalBatch("1h");

        log.info("Init market chart interval 1h complete");
    }

    @Scheduled(cron = "10 3 0 * * *")
    public void syncMarketChartInterval1d() {
        log.info("Start syncing interval 1d...");

        marketChartService.syncIntervalBatch("1d");

        log.info("Init market chart interval 1d complete");
    }

    @Scheduled(cron = "10 4 0 * * MON")
    public void syncMarketChartInterval1w() {
        log.info("Start syncing interval 1w...");

        marketChartService.syncIntervalBatch("1w");

        log.info("Init market chart interval 1w complete");
    }
}
