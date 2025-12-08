package com.hieu.profile_service.exception;

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

    USER_NOT_EXISTED(1310, "User not existed", HttpStatus.NOT_FOUND),

    FULL_NAME_IS_REQUIRED(3101, "Full name is required", HttpStatus.BAD_REQUEST),
    INVALID_DOB(3102, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    DOB_IS_REQUIRED(3103, "Date of birth is required", HttpStatus.BAD_REQUEST),

    FILE_NOT_FOUND(4101, "File not found", HttpStatus.NOT_FOUND),
    INVALID_ACCESS_LEVEL(4102, "Invalid access level", HttpStatus.BAD_REQUEST),
    UNSUPPORTED_FILE_TYPE(4103, "Unsupported file type", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(4104, "File too large", HttpStatus.BAD_REQUEST),
    CANNOT_UPLOAD_FILE(4105, "Cannot upload file", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_GET_URL(4106, "Cannot get url", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_UPDATE_ACCESS_LEVEL(4107, "Cannot update access level", HttpStatus.INTERNAL_SERVER_ERROR),
    CANNOT_DELETE_FILE(4108, "Cannot delete file", HttpStatus.INTERNAL_SERVER_ERROR),
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
