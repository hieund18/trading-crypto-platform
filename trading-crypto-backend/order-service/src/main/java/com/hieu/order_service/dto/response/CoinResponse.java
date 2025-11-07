package com.hieu.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CoinResponse {
    String id;
    String symbol;
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

    Boolean isActive;
    Instant createdAt;
    Instant updatedAt;
}
