package com.hieu.wallet_service.repository.httpclient;

import com.hieu.wallet_service.configuration.AuthenticationRequestInterceptor;
import com.hieu.wallet_service.configuration.CustomFeignErrorDecoder;
import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "identity-service", url = "${app.services.identity}",
        configuration = {CustomFeignErrorDecoder.class, AuthenticationRequestInterceptor.class})
public interface IdentityClient {
    @GetMapping(value = "/users/my-info", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserResponse> getMyInfo();

    @GetMapping(value = "/users/username/{username}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserResponse> getUserByUsername(@PathVariable String username);
}
