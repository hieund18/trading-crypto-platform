package com.hieu.identity_service.mapper;

import com.hieu.identity_service.dto.request.*;
import com.hieu.identity_service.dto.response.EmailVerificationOtpResponse;
import com.hieu.identity_service.dto.response.OtpResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OtpMapper {
    VerifyOtpRequest toVerifyOtpRequest(EmailVerificationRequest request);

    OtpCreationRequest toOtpCreationRequest(EmailVerificationOtpRequest request);

    EmailVerificationOtpResponse toEmailVerificationOtpResponse(OtpResponse otpResponse);

    OtpCreationRequest toOtpCreationRequest(ForgotPasswordOtpRequest request);

    VerifyOtpRequest toVerifyOtpRequest(VerifyForgotPasswordOtpRequest request);

    OtpCreationRequest toOtpCreationRequest(TwoFactorOtpRequest request);

    VerifyOtpRequest toVerifyOtpRequest(TwoFactorVerifyRequest request);
}
