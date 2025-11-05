package com.hieu.wallet_service.exception;

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
    CANNOT_SEND_OTP(1005, "Cannot send otp", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_VERIFY_OTP(1006, "Cannot verify otp", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_OTP(1007, "Invalid OTP", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(1008, "OTP expired", HttpStatus.BAD_REQUEST),
    OTP_ATTEMPT_LIMIT_EXCEEDED(1009, "OTP attempt limit exceeded", HttpStatus.TOO_MANY_REQUESTS),

    USER_NOT_EXISTED(1310, "User not existed", HttpStatus.NOT_FOUND),
    USERNAME_IS_REQUIRED(1303, "Username is required", HttpStatus.BAD_REQUEST),

    INVALID_AMOUNT(6001, "Amount must be greater than 10000", HttpStatus.BAD_REQUEST),
    AMOUNT_IS_REQUIRED(6002, "Amount is required", HttpStatus.BAD_REQUEST),
    BANK_NAME_IS_REQUIRED(6003, "Bank name is required", HttpStatus.BAD_REQUEST),
    BANK_ACCOUNT_IS_REQUIRED(6004, "Bank account is required", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE(6005, "Insufficient balance", HttpStatus.BAD_REQUEST),
    WITHDRAWAL_NOT_EXISTED(6006, "Withdrawal request not existed", HttpStatus.NOT_FOUND),
    INVALID_WITHDRAWAL(6007, "Invalid withdrawal", HttpStatus.BAD_REQUEST),
    TRANSFER_NOT_EXISTED(6008, "Transfer request not existed", HttpStatus.NOT_FOUND),
    INVALID_RECIPIENT(6009, "Invalid recipient", HttpStatus.BAD_REQUEST),
    INVALID_TRANSFER(6010, "Invalid transfer", HttpStatus.BAD_REQUEST),

    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    int code;
    String message;
    HttpStatusCode statusCode;

    public static ErrorCode fromCode(int code){
        for(ErrorCode errorCode : ErrorCode.values()){
            if(errorCode.getCode() == code)
                return errorCode;
        }

        return ErrorCode.UNCATEGORIZED_EXCEPTION;
    }
}
