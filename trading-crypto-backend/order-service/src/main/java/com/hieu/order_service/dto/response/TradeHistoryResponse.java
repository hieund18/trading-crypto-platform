package com.hieu.order_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TradeHistoryResponse {
    String id;

    String userId;

    String coinId;

    String type;

    Double quantity;

    Double price;

    Double amount;

    Instant createdAt;
}
