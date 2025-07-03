package com.hieu.profile_service.controller;

import com.hieu.profile_service.dto.ApiResponse;
import com.hieu.profile_service.dto.PageResponse;
import com.hieu.profile_service.dto.request.ProfileUpdateRequest;
import com.hieu.profile_service.dto.response.UserProfileResponse;
import com.hieu.profile_service.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    @GetMapping
    ApiResponse<PageResponse<UserProfileResponse>> getAllProfiles(
            @PageableDefault(page = 1, size = 10, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles(pageable))
                .build();
    }

    @GetMapping("/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PutMapping("/my-profile")
    ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody @Valid ProfileUpdateRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }

    @PutMapping("/avatar")
    ApiResponse<UserProfileResponse> updateAvatar(@RequestParam("file") MultipartFile file){
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateAvatar(file))
                .build();
    }
}
