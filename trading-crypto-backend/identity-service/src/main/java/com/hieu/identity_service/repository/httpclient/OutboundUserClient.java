package com.hieu.identity_service.repository.httpclient;

import com.hieu.identity_service.dto.response.OutboundUserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "outbound-user", url = "${outbound.identity.google.api-url}")
public interface OutboundUserClient {
    @GetMapping(value = "/oauth2/v1/userinfo", produces = MediaType.APPLICATION_JSON_VALUE)
    OutboundUserResponse getUserInfo(@RequestParam("alt") String alt,
                                     @RequestParam("access_token") String accessToken);
}
