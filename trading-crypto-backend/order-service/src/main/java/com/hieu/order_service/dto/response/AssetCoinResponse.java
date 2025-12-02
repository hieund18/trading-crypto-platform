package com.hieu.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetCoinResponse {
    String coinId;
    String symbol;
    String name;
    String image;

    double currentPrice;
    Double quantity;
    Double buyPrice;
    Double percentageChange;
    Double amountChange;
    Double currentAmount;
    Double percentageAsset;
}
