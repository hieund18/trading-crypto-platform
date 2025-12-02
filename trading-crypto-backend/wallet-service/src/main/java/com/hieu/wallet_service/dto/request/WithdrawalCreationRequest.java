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
public class WithdrawalCreationRequest {
    @NotBlank(message = "BANK_NAME_IS_REQUIRED")
    String bankName;

    @NotBlank(message = "BANK_ACCOUNT_IS_REQUIRED")
    String bankAccount;

    @NotNull(message = "AMOUNT_IS_REQUIRED")
    @DecimalMin(value = "0", message = "INVALID_AMOUNT")
    BigDecimal amount;
}
