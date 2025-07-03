package com.hieu.coin_service.configuration;

import com.hieu.coin_service.service.CoinService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
@Slf4j
public class ApplicationInitConfig {

    @Bean
    public ApplicationRunner applicationRunner(CoinService coinService){
        log.info("Initializing application...");
        return args -> {
            coinService.initCoins();

            log.info("Application initialization complete...");
        };
    }
}
