package com.hieu.identity_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "reset_tokens")
public class ResetToken {
    @Id
    String id;

    @Column(name = "email", nullable = false)
    String email;

    @Column(name = "expiry_time", nullable = false)
    Instant expiryTime;
}
