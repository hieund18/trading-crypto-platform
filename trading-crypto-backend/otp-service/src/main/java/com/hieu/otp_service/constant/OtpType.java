package com.hieu.otp_service.constant;

import com.hieu.otp_service.exception.AppException;
import com.hieu.otp_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum OtpType {
    EMAIL_VERIFICATION(3, 30, 5, 10, "email-verification"),
    FORGOT_PASSWORD(3, 10, 3, 3, "forgot-password"),
    TWO_FACTOR_AUTH(3, 10, 3, 3, "two-factor-auth"),
    TRANSACTION(3, 1, 3, 1, "transaction"),
    WITHDRAW(3, 1, 3, 1, "transaction"),
    TRANSFER(3, 1, 3, 1, "transaction"),
    ;

    OtpType(int maxSendPerWindow, int timeLimitWindow, int maxVerifyAttempts, int otpTtl, String templateCode) {
        this.maxSendPerWindow = maxSendPerWindow;
        this.timeLimitWindow = timeLimitWindow;
        this.maxVerifyAttempts = maxVerifyAttempts;
        this.otpTtl = otpTtl;
        this.templateCode = templateCode;
    }

    int maxSendPerWindow;
    int timeLimitWindow;
    int maxVerifyAttempts;
    int otpTtl;
    String templateCode;

    public static OtpType toOtpType(String otpType) {
        OtpType type;
        try {
            type = OtpType.valueOf(otpType);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        return type;
    }
}
