package com.hieu.identity_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "refresh_tokens")
public class RefreshToken {
    @Id
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "issue_time", nullable = false)
    Instant issueTime;

    @Column(name = "expiry_time", nullable = false)
    Instant expiryTime;
}
