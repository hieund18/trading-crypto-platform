package com.hieu.profile_service.configuration;

import java.io.IOException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.profile_service.dto.ApiResponse;
import com.hieu.profile_service.exception.AppException;
import com.hieu.profile_service.exception.ErrorCode;
import feign.Response;
import feign.Util;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomFeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String s, Response response) {
        try {
            String body = Util.toString(response.body().asReader());
            log.info("Body: {}", body);

            ObjectMapper objectMapper = new ObjectMapper();

            ApiResponse<?> apiResponse = objectMapper.readValue(body, ApiResponse.class);
            ErrorCode errorCode = fromCode(apiResponse.getCode());

            return new AppException(errorCode);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private ErrorCode fromCode(int code) {
        for (ErrorCode errorCode : ErrorCode.values()) {
            if (code == errorCode.getCode()) return errorCode;
        }

        return ErrorCode.UNCATEGORIZED_EXCEPTION;
    }
}
