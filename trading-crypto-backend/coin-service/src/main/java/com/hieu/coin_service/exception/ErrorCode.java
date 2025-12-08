package com.hieu.coin_service.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(1002, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1003, "You do not have permission", HttpStatus.FORBIDDEN),

    INVALID_COIN(5101, "Invalid coin", HttpStatus.BAD_REQUEST),
    COIN_EXISTED(5102, "Coin existed", HttpStatus.BAD_REQUEST),
    COIN_NOT_EXISTED(5103, "Coin not existed", HttpStatus.NOT_FOUND),
    CANNOT_EXCHANGE_COIN_SYMBOL(5004, "Cannot exchange coin symbol", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_SYMBOL(5005, "Invalid symbol", HttpStatus.BAD_REQUEST),
    BINANCE_SYMBOL_EXISTED(5006, "Binance symbol existed", HttpStatus.BAD_REQUEST),
    MARKET_CHART_INVALID(5007, "Market chart not found", HttpStatus.NOT_FOUND),
    INVALID_LIMIT(5008, "Invalid limit", HttpStatus.BAD_REQUEST),
    INVALID_INTERVAL(5009, "Invalid interval", HttpStatus.BAD_REQUEST),
    INVALID_PRICE(5010, "Invalid price", HttpStatus.BAD_REQUEST),
    ;

    int code;
    String message;
    HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
