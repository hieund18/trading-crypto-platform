package com.hieu.otp_service.controller;

import com.hieu.otp_service.dto.ApiResponse;
import com.hieu.otp_service.dto.request.OtpCreationRequest;
import com.hieu.otp_service.dto.request.VerifyOtpRequest;
import com.hieu.otp_service.dto.response.OtpResponse;
import com.hieu.otp_service.dto.response.VerifyOtpResponse;
import com.hieu.otp_service.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpController {
    OtpService otpService;

    @PostMapping("/send")
    ApiResponse<OtpResponse> createOtp(@RequestBody OtpCreationRequest request) {

        return ApiResponse.<OtpResponse>builder()
                .result(otpService.createOtp(request))
                .build();
    }

    @PostMapping("/verify")
    ApiResponse<VerifyOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return ApiResponse.<VerifyOtpResponse>builder()
                .result(otpService.verifyOtp(request))
                .build();
    }
}
