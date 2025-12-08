package com.hieu.identity_service.repository.httpclient;

import java.util.List;

import com.hieu.identity_service.dto.response.GithubEmailResponse;
import com.hieu.identity_service.dto.response.GithubUserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "github-user", url = "${outbound.identity.github.api-url}")
public interface GithubUserClient {
    @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    GithubUserResponse getUserInfo(@RequestHeader("Authorization") String authorization);

    @GetMapping(value = "/user/emails", produces = MediaType.APPLICATION_JSON_VALUE)
    List<GithubEmailResponse> getUserEmail(@RequestHeader("Authorization") String authorization);
}
