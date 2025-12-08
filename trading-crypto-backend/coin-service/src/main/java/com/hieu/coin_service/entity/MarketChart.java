package com.hieu.coin_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "market_charts")
public class MarketChart {
    @Id
    String id;

    String symbol;

    String interval;

    Long openTime;
    Long closeTime;

    Double openPrice;

    Double highPrice;

    Double lowPrice;

    Double closePrice;

    Double volume;
}
