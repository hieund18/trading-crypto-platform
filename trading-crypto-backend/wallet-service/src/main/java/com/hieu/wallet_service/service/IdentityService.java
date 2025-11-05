package com.hieu.wallet_service.service;

import com.hieu.wallet_service.dto.ApiResponse;
import com.hieu.wallet_service.dto.response.UserResponse;
import com.hieu.wallet_service.repository.httpclient.IdentityClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class IdentityService {
    IdentityClient identityClient;

    ApiResponse<UserResponse> getMyInfo(){
        log.info("Calling get my info");

        return identityClient.getMyInfo();
    }

    ApiResponse<UserResponse> getUserByUsername(String username){
        log.info("Calling get user by username");

        return identityClient.getUserByUsername(username);
    }
}
