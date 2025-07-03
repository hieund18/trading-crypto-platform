package com.hieu.identity_service.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import feign.Response;
import feign.Util;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class CustomFeignErrorDecoder implements ErrorDecoder {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Exception decode(String s, Response response) {
        try {
            String body = Util.toString(response.body().asReader());
            log.info("Body: {}", body);

//            JsonNode node = objectMapper.readTree(body);
//            int code = node.get("code").asInt();

            ApiResponse<?> apiResponse = objectMapper.readValue(body, ApiResponse.class);

            ErrorCode errorCode = ErrorCode.fromCode(apiResponse.getCode());

            return new AppException(errorCode);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
