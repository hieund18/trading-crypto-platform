package com.hieu.identity_service.repository.httpclient;

import com.hieu.identity_service.dto.request.GithubTokenRequest;
import com.hieu.identity_service.dto.response.GithubTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "github-identity", url = "${outbound.identity.github.token-uri}")
public interface GithubIdentityClient {
    @PostMapping(value = "/access_token", produces = MediaType.APPLICATION_JSON_VALUE)
    GithubTokenResponse exchangeToken(@QueryMap GithubTokenRequest request);
}
