package com.hieu.otp_service.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1002, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1003, "You do not have permission", HttpStatus.FORBIDDEN),
    RATE_LIMIT_EXCEEDED(1004, "Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS),

    INVALID_OTP(1007, "Invalid OTP", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1008, "OTP expired", HttpStatus.BAD_REQUEST),
    OTP_ATTEMPT_LIMIT_EXCEEDED(1009, "OTP attempt limit exceeded", HttpStatus.TOO_MANY_REQUESTS),

    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    int code;
    String message;
    HttpStatusCode statusCode;
}
