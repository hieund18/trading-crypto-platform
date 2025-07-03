package com.hieu.identity_service.repository.httpclient;

import com.hieu.identity_service.configuration.CustomFeignErrorDecoder;
import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.ProfileCreationRequest;
import com.hieu.identity_service.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "profile-service", url = "${app.services.profile}",
        configuration = {CustomFeignErrorDecoder.class})
public interface ProfileClient {
    @PostMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request);

    @DeleteMapping(value = "/internal/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<Void> deleteProfileByUserId(@PathVariable String userId);
}
