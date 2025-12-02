package com.hieu.coin_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MarketChartResponse {
    Long openTime;
    Long closeTime;

    Double openPrice;

    Double highPrice;

    Double lowPrice;

    Double closePrice;

    Double volume;
}
