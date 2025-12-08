package com.hieu.identity_service.dto.response;

import java.time.Instant;
import java.util.Set;

import com.hieu.identity_service.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
    Set<Role> roles;
}
