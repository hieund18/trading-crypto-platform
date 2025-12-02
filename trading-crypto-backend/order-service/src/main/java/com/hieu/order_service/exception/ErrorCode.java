package com.hieu.order_service.exception;

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

    CANNOT_GET_COIN(5001, "Cannot get coin info", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_COIN(5101, "Invalid coin", HttpStatus.BAD_REQUEST),
    COIN_NOT_EXISTED(5103, "Coin not existed", HttpStatus.NOT_FOUND),

    CANNOT_TRADE_WALLET(6001, "Cannot trade wallet", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_AMOUNT(6101, "Amount must be greater than 1", HttpStatus.BAD_REQUEST),
    AMOUNT_IS_REQUIRED(6102, "Amount is required", HttpStatus.BAD_REQUEST),
    BANK_NAME_IS_REQUIRED(6103, "Bank name is required", HttpStatus.BAD_REQUEST),
    BANK_ACCOUNT_IS_REQUIRED(6104, "Bank account is required", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE(6105, "Insufficient balance", HttpStatus.BAD_REQUEST),
    WITHDRAWAL_NOT_EXISTED(6106, "Withdrawal request not existed", HttpStatus.NOT_FOUND),
    INVALID_WITHDRAWAL(6107, "Invalid withdrawal", HttpStatus.BAD_REQUEST),
    TRANSFER_NOT_EXISTED(6108, "Transfer request not existed", HttpStatus.NOT_FOUND),
    INVALID_RECIPIENT(6109, "Invalid recipient", HttpStatus.BAD_REQUEST),
    INVALID_TRANSFER(6110, "Invalid transfer", HttpStatus.BAD_REQUEST),

    INVALID_QUANTITY(7101, "Invalid quantity", HttpStatus.BAD_REQUEST),
    INVALID_TIME_TYPE(7102, "Invalid time type", HttpStatus.BAD_REQUEST),

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
