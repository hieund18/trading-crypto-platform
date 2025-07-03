package com.hieu.identity_service.controller;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.*;
import com.hieu.identity_service.dto.response.EmailVerificationOtpResponse;
import com.hieu.identity_service.dto.response.UserResponse;
import com.hieu.identity_service.dto.response.VerifyForgotPasswordOtpResponse;
import com.hieu.identity_service.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.shaded.com.google.protobuf.Api;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    @PostMapping("/registration")
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @PostMapping("/register-local-login")
    ApiResponse<Void> createUsernamePassword(@RequestBody @Valid UsernamePasswordCreationRequest request){
        userService.createUsernamePassword(request);

        return ApiResponse.<Void>builder()
                .message("Username and password have been created, you could use it to local login")
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<UserResponse>> getUsers(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .result(userService.getUsers(page, size))
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PostMapping("/change-password")
    ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(request);

        return ApiResponse.<Void>builder()
                .message("Password changed successfully")
                .build();
    }

    @PutMapping("/roles/{userId}")
    ApiResponse<UserResponse> updateUserRoles(@PathVariable String userId, @RequestBody UserRoleUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserRoles(userId, request))
                .build();
    }

    @PatchMapping("/status/{userId}")
    ApiResponse<UserResponse> updateUserStatus(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserStatus(userId))
                .build();
    }

    @PatchMapping("/me/2fa")
    ApiResponse<UserResponse> update2FA() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.update2FA())
                .build();
    }

    @PostMapping("/verify-email/send-otp")
    ApiResponse<EmailVerificationOtpResponse> sendEmailVerificationOtp(@RequestBody EmailVerificationOtpRequest request) {
        return ApiResponse.<EmailVerificationOtpResponse>builder()
                .result(userService.sendEmailVerificationOtp(request))
                .build();
    }

    @PostMapping("/verify-email/verify-otp")
    ApiResponse<UserResponse> verifyEmail(@RequestBody EmailVerificationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.verifyEmail(request))
                .build();
    }

    @PostMapping("/forgot-password/send-otp")
    ApiResponse<Void> sendForgotPasswordOtp(@RequestBody ForgotPasswordOtpRequest request) {
        userService.sendForgotPasswordOtp(request);

        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/forgot-password/verify-otp")
    ApiResponse<VerifyForgotPasswordOtpResponse> verifyForgotPasswordOtp(@RequestBody VerifyForgotPasswordOtpRequest request) {
        return ApiResponse.<VerifyForgotPasswordOtpResponse>builder()
                .result(userService.verifyForgotPasswordOtp(request))
                .build();
    }

    @PostMapping("/forgot-password/reset-password")
    ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        userService.resetPassword(request);

        return ApiResponse.<Void>builder().build();
    }
}
