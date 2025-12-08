package com.hieu.otp_service.repository;

import java.util.Optional;

import com.hieu.otp_service.entity.Otp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpRepository extends MongoRepository<Otp, String> {
    void deleteByRecipientAndOtpType(String recipient, String otpType);

    Optional<Otp> findByRecipientAndOtpType(String recipient, String otpType);
}
