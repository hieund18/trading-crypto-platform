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
public class AssetSellRequest {
    String coinId;

    @NotNull(message = "INVALID_QUANTITY")
    @DecimalMin(value = "0", message = "INVALID_QUANTITY")
    Double quantity;
}
