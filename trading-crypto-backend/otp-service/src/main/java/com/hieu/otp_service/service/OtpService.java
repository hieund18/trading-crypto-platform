package com.hieu.otp_service.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import com.hieu.common.dto.NotificationEvent;
import com.hieu.otp_service.constant.OtpType;
import com.hieu.otp_service.constant.PredefinedChannel;
import com.hieu.otp_service.dto.request.OtpCreationRequest;
import com.hieu.otp_service.dto.request.VerifyOtpRequest;
import com.hieu.otp_service.dto.response.OtpResponse;
import com.hieu.otp_service.dto.response.VerifyOtpResponse;
import com.hieu.otp_service.entity.Otp;
import com.hieu.otp_service.entity.RateLimit;
import com.hieu.otp_service.exception.AppException;
import com.hieu.otp_service.exception.ErrorCode;
import com.hieu.otp_service.mapper.OtpMapper;
import com.hieu.otp_service.repository.OtpRepository;
import com.hieu.otp_service.repository.RateLimitRepository;
import com.hieu.otp_service.util.OtpUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpService {
    OtpRepository otpRepository;
    RateLimitRepository rateLimitRepository;
    OtpMapper otpMapper;
    OtpUtil otpUtil;
    KafkaTemplate<String, Object> kafkaTemplate;

    PasswordEncoder passwordEncoder;

    @Transactional
    public OtpResponse createOtp(OtpCreationRequest request) {
        String recipient = request.getRecipient();
        String otpType = request.getOtpType();

        OtpType type;
        try {
            type = OtpType.valueOf(otpType);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        if (!checkRateLimit(recipient, otpType)) throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED);

        otpRepository.deleteByRecipientAndOtpType(recipient, otpType);

        Otp otp = otpMapper.toOtp(request);

        String otpCode = otpUtil.generateOtpCode();

        otp.setOtpCode(passwordEncoder.encode(otpCode));
        otp.setAttemptCount(0);
        otp.setExpiryTime(Instant.now().plus(type.getOtpTtl(), ChronoUnit.MINUTES));

        otp = otpRepository.save(otp);

        Map<String, Object> param = new HashMap<>();
        param.put("otp", otpCode);
        param.put("expiryTime", type.getOtpTtl());

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel(PredefinedChannel.EMAIL)
                .templateCode(type.getTemplateCode())
                .recipient(request.getRecipient())
                .param(param)
                .build();

        log.info("Dang chuan bi gui tin nhan Kafka cho email: {}", request.getRecipient());

        kafkaTemplate.send("notification-delivery", notificationEvent).whenComplete((result, ex) -> {
            if (ex == null) {
                log.info(
                        "GUI THANH CONG! Offset: {}", result.getRecordMetadata().offset());
            } else {
                log.error("GUI THAT BAI :( Loi chi tiet: ", ex);
            }
        });

        var response = otpMapper.toOtpResponse(otp);
        response.setOtpTtl(type.getOtpTtl());

        return response;
    }

    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        Otp otp = otpRepository
                .findByRecipientAndOtpType(request.getRecipient(), request.getOtpType())
                .orElse(null);

        if (otp == null) throw new AppException(ErrorCode.INVALID_OTP);

        if (otp.getExpiryTime().isBefore(Instant.now())) throw new AppException(ErrorCode.OTP_EXPIRED);

        if (otp.getAttemptCount() >= 5) {
            //            otpRepository.deleteByRecipientAndOtpType(request.getRecipient(), request.getOtpType());
            throw new AppException(ErrorCode.OTP_ATTEMPT_LIMIT_EXCEEDED);
        }

        if (!passwordEncoder.matches(request.getOtpCode(), otp.getOtpCode())) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        otpRepository.deleteByRecipientAndOtpType(request.getRecipient(), request.getOtpType());

        return VerifyOtpResponse.builder().valid(true).build();
    }

    private boolean checkRateLimit(String recipient, String otpType) {
        RateLimit rateLimit = rateLimitRepository
                .findByRecipientAndOtpType(recipient, otpType)
                .orElse(null);

        OtpType type = OtpType.valueOf(otpType);

        if (rateLimit != null) {
            if (rateLimit.getCount() >= type.getMaxSendPerWindow()) return false;

            rateLimit.setCount(rateLimit.getCount() + 1);
            rateLimitRepository.save(rateLimit);
            return true;
        }

        rateLimit = RateLimit.builder()
                .recipient(recipient)
                .otpType(otpType)
                .count(1)
                .expiryTime(Instant.now().plus(type.getTimeLimitWindow(), ChronoUnit.MINUTES))
                .build();

        rateLimitRepository.save(rateLimit);
        return true;
    }
}
