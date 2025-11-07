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
    String coinName;
    String image;
    Double quantity;
    Double buyPrice;
    Double percentageChange;
    Double amountChange;
    Double currentAmount;
    Double percentageAsset;
}
