package com.hieu.coin_service.dto.response;

import java.time.Instant;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CoinUpdateResponse {
    String id;

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
}
