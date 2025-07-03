package com.hieu.otp_service.repository;

import com.hieu.otp_service.entity.RateLimit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RateLimitRepository extends MongoRepository<RateLimit, String> {
    Optional<RateLimit> findByRecipientAndOtpType(String recipient, String otpType);
}
