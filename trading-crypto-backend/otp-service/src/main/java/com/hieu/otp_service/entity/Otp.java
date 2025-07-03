package com.hieu.otp_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

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
