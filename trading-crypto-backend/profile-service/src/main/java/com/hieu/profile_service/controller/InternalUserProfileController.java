package com.hieu.profile_service.controller;

import java.util.List;

import com.hieu.profile_service.dto.ApiResponse;
import com.hieu.profile_service.dto.request.ProfileCreationRequest;
import com.hieu.profile_service.dto.response.UserProfileResponse;
import com.hieu.profile_service.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalUserProfileController {
    UserProfileService userProfileService;

    @PostMapping
    ApiResponse<UserProfileResponse> createProfile(@RequestBody @Valid ProfileCreationRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.createProfile(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserProfileResponse>> getProfilesByUserIds(@RequestParam("userIds") List<String> userIds) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getProfilesByUserIds(userIds))
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserProfileResponse> getProfileByUserId(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfileByUserId(userId))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<Void> deleteProfileByUserId(@PathVariable String userId) {
        userProfileService.deleteProfileByUserId(userId);

        return ApiResponse.<Void>builder().build();
    }
}
