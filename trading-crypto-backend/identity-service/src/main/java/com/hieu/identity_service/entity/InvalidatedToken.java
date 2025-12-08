package com.hieu.identity_service.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
