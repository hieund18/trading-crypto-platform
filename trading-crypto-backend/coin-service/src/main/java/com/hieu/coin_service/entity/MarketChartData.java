package com.hieu.coin_service.entity;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "market_chart_data")
public class MarketChartData {
    @MongoId
    String id;

    String coinId;

    int days;

    long timestamp;

    double price;
}
