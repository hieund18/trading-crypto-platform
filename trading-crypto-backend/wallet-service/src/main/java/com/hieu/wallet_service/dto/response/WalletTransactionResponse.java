package com.hieu.wallet_service.dto.response;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletTransactionResponse {
    String id;

    String userId;

    String type;

    BigDecimal amount;

    BigDecimal balanceBefore;

    BigDecimal balanceAfter;

    Instant createdAt;
}
