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
public class UsernamePasswordCreationRequest {
    @NotBlank(message = "USERNAME_IS_REQUIRED")
    @Size(min = 3, message = "INVALID_USERNAME")
    String username;

    @NotBlank(message = "PASSWORD_IS_REQUIRED")
    @Size(min = 3, message = "INVALID_PASSWORD")
    String password;
}
