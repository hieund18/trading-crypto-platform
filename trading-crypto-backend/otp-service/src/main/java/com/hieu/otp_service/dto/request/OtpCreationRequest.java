package com.hieu.otp_service.dto.request;

import java.util.Map;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OtpCreationRequest {
    String recipient;
    String otpType;
    Map<String, Object> param;
}
