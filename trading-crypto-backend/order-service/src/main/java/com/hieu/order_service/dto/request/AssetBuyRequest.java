package com.hieu.order_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetBuyRequest {
    String coinId;

    @NotNull(message = "AMOUNT_IS_REQUIRED")
    @DecimalMin(value = "1", message = "INVALID_AMOUNT")
    Double amount;
}
