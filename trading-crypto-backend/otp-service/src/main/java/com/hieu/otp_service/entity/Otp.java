package com.hieu.otp_service.entity;

import java.time.Instant;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "otps")
public class Otp {
    @MongoId
    String id;

    String recipient;

    String otpCode;

    String otpType;

    int attemptCount;

    @Indexed(expireAfterSeconds = 0)
    Instant expiryTime;
}
