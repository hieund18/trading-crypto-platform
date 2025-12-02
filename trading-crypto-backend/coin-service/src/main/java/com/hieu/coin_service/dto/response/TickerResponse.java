package com.hieu.coin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TickerResponse {
    String binanceSymbol;
    Double currentPrice;
    Double priceChangePercentage24h;
    Double volume;
}
