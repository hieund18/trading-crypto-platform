package com.hieu.wallet_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String email;
    boolean emailVerified;
    Boolean isActive;
    Boolean twoFactorEnabled;
    long tokenVersion;
    String googleAccountId;
    String githubAccountId;
    Instant createdAt;
    Instant updatedAt;
    Boolean noPassword;
}
