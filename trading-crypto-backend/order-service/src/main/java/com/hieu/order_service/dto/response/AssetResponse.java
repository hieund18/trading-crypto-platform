package com.hieu.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetResponse {
    Double totalCurrentAmount;
    Double totalAmountChange;
    Double totalPercentageChange;

    List<AssetCoinResponse> coins;
}
