package com.hieu.identity_service.service;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.request.ProfileCreationRequest;
import com.hieu.identity_service.dto.response.UserProfileResponse;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.repository.httpclient.ProfileClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProfileService {
    ProfileClient profileClient;

    // retry ( circuitbreaker (: mac dinh goi retry roi den circuitbreaker nen can dao vi tri qua aspect order
    @CircuitBreaker(name = "profileService", fallbackMethod = "fallBackCreateProfile")
    @Retry(name = "profileService")
    public ApiResponse<UserProfileResponse> createProfile(ProfileCreationRequest request) {
        log.info("Calling create profile");
        return profileClient.createProfile(request);
    }

    public ApiResponse<UserProfileResponse> fallBackCreateProfile(ProfileCreationRequest request, Throwable ex) {// Throwable ex bat tat ca loi ke ca ignore exception
        if (ex instanceof AppException) {
            throw (AppException) ex;
        }

        log.error("Fallback: Profile service unavailable ", ex);
        throw new AppException(ErrorCode.CANNOT_CREATE_PROFILE);
    }

    @Retry(name = "profileService", fallbackMethod = "")
    public ApiResponse<Void> deleteProfileByUserId(String userId){
        log.info("Calling delete profile");
        return profileClient.deleteProfileByUserId(userId);
    }

//    public ApiResponse<Void> fallBackDeleteProfile(String userId, Throwable ex){
//        log.error("Fallback: Profile service unavailable ", ex);
//        return ApiResponse.<Void>builder().build();
//    }
}
