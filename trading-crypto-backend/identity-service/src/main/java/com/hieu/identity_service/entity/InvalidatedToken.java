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
@Entity(name = "invalidated_tokens")
public class InvalidatedToken {
    @Id
    String id;

    @Column(name = "expiry_time")
    Instant expiryTime;
}
