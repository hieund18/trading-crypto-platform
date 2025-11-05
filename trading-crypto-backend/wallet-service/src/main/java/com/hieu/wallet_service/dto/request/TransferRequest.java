package com.hieu.wallet_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransferRequest {
    @NotBlank(message = "USERNAME_IS_REQUIRED")
    String toUsername;

    @NotNull(message = "AMOUNT_IS_REQUIRED")
    @DecimalMin(value = "10000", message = "INVALID_AMOUNT")
    BigDecimal amount;
}
