package com.hieu.coin_service.dto.response;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CoinGeckoMarketDataResponse {
    String id;
    String symbol;
    String name;
    String image;
    double currentPrice;
    double marketCap;
    int marketCapRank;

    @JsonProperty("high_24h")
    double high24h;

    @JsonProperty("low_24h")
    double low24h;

    @JsonProperty("price_change_24h")
    double priceChange24h;

    @JsonProperty("price_change_percentage_24h")
    double priceChangePercentage24h;

    @JsonProperty("market_cap_change_24h")
    double marketCapChange24h;

    @JsonProperty("market_cap_change_percentage_24h")
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
