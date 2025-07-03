package com.hieu.identity_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
    @NotBlank(message = "PASSWORD_IS_REQUIRED")
    String currentPassword;

    @NotBlank(message = "PASSWORD_IS_REQUIRED")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String newPassword;

    @NotBlank(message = "PASSWORD_IS_REQUIRED")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String confirmPassword;
}
