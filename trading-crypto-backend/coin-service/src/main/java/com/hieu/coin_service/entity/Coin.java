package com.hieu.coin_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "coins")
public class Coin {
    @MongoId
    String id;

    String symbol;

    @Indexed(unique = true, sparse = true)
    String binanceSymbol;

    String name;

    String image;

    double currentPrice;
    double marketCap;
    int marketCapRank;

    double high24h;

    double low24h;

    double priceChange24h;

    double priceChangePercentage24h;

    double marketCapChange24h;

    double marketCapChangePercentage24h;
    double totalVolume;
    double circulatingSupply;
    double totalSupply;
    double maxSupply;
    double ath;
    double athChangePercentage;
    Instant athDate;
    double atl;
    double atlChangePercentage;
    Instant atlDate;

    @Indexed
    Integer trendingRank;

    Boolean isActive;

    @CreatedDate
    Instant createdAt;

    @LastModifiedDate
    Instant updatedAt;
}
