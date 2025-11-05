package com.hieu.wallet_service.service;

import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.request.OtpCreationRequest;
import com.hieu.wallet_service.dto.response.OtpResponse;
import com.hieu.wallet_service.dto.request.VerifyOtpRequest;
import com.hieu.wallet_service.dto.response.VerifyOtpResponse;
import com.hieu.wallet_service.repository.httpclient.OtpClient;
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

    public ApiResponse<OtpResponse> createOtp(OtpCreationRequest request) {
        log.info("Calling create otp");
        return otpClient.createOtp(request);
    }


    public ApiResponse<VerifyOtpResponse> verifyOtp(VerifyOtpRequest request) {
        log.info("Calling verify otp");
        return otpClient.verifyOtp(request);
    }

}
