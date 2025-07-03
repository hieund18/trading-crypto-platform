package com.hieu.identity_service.constant;

import lombok.Getter;

@Getter
public enum OtpType {
    EMAIL_VERIFICATION,
    FORGOT_PASSWORD,
    TWO_FACTOR_AUTH,
}
