package com.hieu.identity_service.controller;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.*;
import com.hieu.identity_service.dto.response.AuthenticationResponse;
import com.hieu.identity_service.dto.response.EmailVerificationOtpResponse;
import com.hieu.identity_service.dto.response.IntrospectResponse;
import com.hieu.identity_service.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<Object> authenticate(@RequestBody AuthenticationRequest request) {
        return ApiResponse.<Object>builder()
                .result(authenticationService.authenticate(request))
                .build();
    }

    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> outboundAuthenticate(@RequestParam("code") String code) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.outboundAuthenticate(code))
                .build();
    }

    @PostMapping("/github/authentication")
    ApiResponse<AuthenticationResponse> authenticateGithub(@RequestParam("code") String code) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.authenticateGithub(code))
                .build();
    }

    @PostMapping("/outbound/link")
    ApiResponse<Void> linkGoogleAccount(@RequestParam("code") String code) {
        authenticationService.linkGoogleAccount(code);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/github/link")
    ApiResponse<Void> linkGithubAccount(@RequestParam("code") String code) {
        authenticationService.linkGithubAccount(code);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        return ApiResponse.<IntrospectResponse>builder()
                .result(authenticationService.introspect(request))
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refreshToken(@RequestBody RefreshRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.refreshToken(request))
                .build();
    }

    @PostMapping("/2fa/verify-otp")
    ApiResponse<AuthenticationResponse> verify2FA(@RequestBody TwoFactorVerifyRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.verify2FA(request))
                .build();
    }

    @PostMapping("/2fa/send-otp")
    ApiResponse<Void> sendTwoFactorOtp(@RequestBody TwoFactorOtpRequest request) {
        authenticationService.sendTwoFactorOtp(request);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/verify-email/send-otp")
    ApiResponse<EmailVerificationOtpResponse> sendEmailVerificationOtp(@RequestBody EmailVerificationOtpRequest request) {
        return ApiResponse.<EmailVerificationOtpResponse>builder()
                .result(authenticationService.sendEmailVerificationOtp(request))
                .build();
    }

    @PostMapping("/verify-email/verify-otp")
    ApiResponse<AuthenticationResponse> verifyEmail(@RequestBody EmailVerificationRequest request) {
        return ApiResponse.<AuthenticationResponse>builder()
                .result(authenticationService.verifyEmail(request))
                .build();
    }
}
