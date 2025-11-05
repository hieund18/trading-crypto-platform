package com.hieu.wallet_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WithdrawalResponse {
    String id;

    String userId;

    String bankName;

    String bankAccount;

    BigDecimal amount;

    String status;

    Instant createdAt;
}
