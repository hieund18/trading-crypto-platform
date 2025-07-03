package com.hieu.otp_service.mapper;

import com.hieu.otp_service.dto.request.OtpCreationRequest;
import com.hieu.otp_service.dto.response.OtpResponse;
import com.hieu.otp_service.entity.Otp;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OtpMapper {

    Otp toOtp(OtpCreationRequest request);

    OtpResponse toOtpResponse(Otp otp);
}
