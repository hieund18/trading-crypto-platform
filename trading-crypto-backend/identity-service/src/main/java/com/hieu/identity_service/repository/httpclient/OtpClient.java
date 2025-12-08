package com.hieu.identity_service.repository.httpclient;

import com.hieu.identity_service.configuration.CustomFeignErrorDecoder;
import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.OtpCreationRequest;
import com.hieu.identity_service.dto.request.VerifyOtpRequest;
import com.hieu.identity_service.dto.response.OtpResponse;
import com.hieu.identity_service.dto.response.VerifyOtpResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "otp-service",
        url = "${app.services.otp}",
        configuration = {CustomFeignErrorDecoder.class})
public interface OtpClient {
    @PostMapping(value = "/send", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<OtpResponse> createOtp(@RequestBody OtpCreationRequest request);

    @PostMapping(value = "/verify", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<VerifyOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest request);
}
