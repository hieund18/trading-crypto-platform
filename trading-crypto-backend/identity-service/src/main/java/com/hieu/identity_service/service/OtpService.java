package com.hieu.identity_service.service;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.OtpCreationRequest;
import com.hieu.identity_service.dto.request.VerifyOtpRequest;
import com.hieu.identity_service.dto.response.OtpResponse;
import com.hieu.identity_service.dto.response.VerifyOtpResponse;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.repository.httpclient.OtpClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpService {
    OtpClient otpClient;

    @CircuitBreaker(name = "otpService", fallbackMethod = "fallBackCreateOtp")
    @Retry(name = "otpService")
    public ApiResponse<OtpResponse> createOtp(OtpCreationRequest request) {
        log.info("Calling create otp");
        return otpClient.createOtp(request);
    }

    public ApiResponse<OtpResponse> fallBackCreateOtp(OtpCreationRequest request, Throwable ex) {
        if (ex instanceof AppException) throw (AppException) ex;

        log.error("Fallback: Otp service unavailable", ex);
        throw new AppException(ErrorCode.CANNOT_SEND_OTP);
    }

    @CircuitBreaker(name = "otpService", fallbackMethod = "fallBackVerifyOtp")
    @Retry(name = "otpService")
    public ApiResponse<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request) {
        log.info("Calling verify otp");
        return otpClient.verifyOtp(request);
    }

    public ApiResponse<VerifyOtpResponse> fallBackVerifyOtp(VerifyOtpRequest request, Throwable ex) {
        if (ex instanceof AppException) throw (AppException) ex;

        log.error("Fallback: Otp service unavailable", ex);
        throw new AppException(ErrorCode.CANNOT_VERIFY_OTP);
    }
}
