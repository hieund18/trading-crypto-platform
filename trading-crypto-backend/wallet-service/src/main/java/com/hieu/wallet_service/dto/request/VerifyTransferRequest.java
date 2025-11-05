package com.hieu.wallet_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VerifyTransferRequest {
    @NotBlank(message = "INVALID_TRANSFER")
    String transferId;

    String otpCode;
}
