package com.hieu.identity_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

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
