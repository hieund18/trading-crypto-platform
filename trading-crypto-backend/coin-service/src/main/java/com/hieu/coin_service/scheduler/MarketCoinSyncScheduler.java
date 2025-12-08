package com.hieu.coin_service.scheduler;

import com.hieu.coin_service.service.CoinService;
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
public class MarketCoinSyncScheduler {
    CoinService coinService;

    // @Scheduled(fixedRate = 1000 * 60 * 60 * 12)
    public void syncAllMaster() {
        log.info("Start master sync...");

        coinService.syncCoinGeckoMaster();
        coinService.syncBinanceSymbolMaster();

        log.info("Master sync complete");
    }

    @Scheduled(fixedRate = 1000 * 60 * 15)
    public void syncMarketCoin() {
        log.info("Start sync market...");

        coinService.syncCoinData();
        coinService.syncTrendingCoin();

        log.info("Sync market complete");
    }
}
