package com.hieu.identity_service.exception;

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

    //permission error
    PERMISSION_EXISTED(1101, "Permission existed", HttpStatus.BAD_REQUEST),
    PERMISSION_IS_REQUIRED(1102, "Permission is required", HttpStatus.BAD_REQUEST),

    //role error
    ROLE_EXISTED(1201, "Role existed", HttpStatus.BAD_REQUEST),
    ROLE_IS_REQUIRED(1202, "Role is required", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1203, "Role not existed", HttpStatus.NOT_FOUND),
    CANNOT_UPDATE_SYSTEM_ROLE(1204, "Cannot update system role", HttpStatus.BAD_REQUEST),

    //user error
    USER_EXISTED(1301, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_EXISTED(1302, "Username existed", HttpStatus.BAD_REQUEST),
    USERNAME_IS_REQUIRED(1303, "Username is required", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(1304, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1305, "Email existed", HttpStatus.BAD_REQUEST),
    EMAIL_IS_REQUIRED(1306, "Email is required", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1307, "Invalid email address", HttpStatus.BAD_REQUEST),
    PASSWORD_IS_REQUIRED(1308, "Password is required", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1309, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1310, "User not existed", HttpStatus.NOT_FOUND),
    INVALID_CURRENT_PASSWORD(1311, "Invalid current password", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1312, "New password and confirm password do not match", HttpStatus.BAD_REQUEST),
    DEACTIVATED_USER(1313, "User is deactivated", HttpStatus.FORBIDDEN),
    EMAIL_VERIFIED(1314, "Email is already verified", HttpStatus.BAD_REQUEST),
    CANNOT_ENABLE_2FA(1315, "Update and verify email is required", HttpStatus.BAD_REQUEST),
    PASSWORD_EXISTED(1316, "Password existed", HttpStatus.BAD_REQUEST),
    LOGIN_AND_LINK_REQUIRED(1317, "Email already registered. Please login and link your account.", HttpStatus.BAD_REQUEST),
    ACCOUNT_LINKED_GOOGLE(1318, "Account has been linked to google", HttpStatus.BAD_REQUEST),
    GOOGLE_ACCOUNT_EXISTED(1319, "Google account linked to another user", HttpStatus.BAD_REQUEST),
    ACCOUNT_LINKED_GITHUB(1320, "Account has been linked to github", HttpStatus.BAD_REQUEST),
    GITHUB_ACCOUNT_EXISTED(1321, "Github account linked to another user", HttpStatus.BAD_REQUEST),

    CANNOT_CREATE_PROFILE(3001, "Cannot create profile", HttpStatus.INTERNAL_SERVER_ERROR),
    FULL_NAME_IS_REQUIRED(3101, "Full name is required", HttpStatus.BAD_REQUEST),
    INVALID_DOB(3102, "Your age must be at least 18", HttpStatus.BAD_REQUEST),
    DOB_IS_REQUIRED(3103, "Date of birth is required", HttpStatus.BAD_REQUEST),

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
