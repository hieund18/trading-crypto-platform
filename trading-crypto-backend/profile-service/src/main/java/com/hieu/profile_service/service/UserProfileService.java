package com.hieu.profile_service.service;

import com.hieu.profile_service.constant.AccessScope;
import com.hieu.profile_service.constant.FileType;
import com.hieu.profile_service.dto.PageResponse;
import com.hieu.profile_service.dto.request.ProfileCreationRequest;
import com.hieu.profile_service.dto.request.ProfileUpdateRequest;
import com.hieu.profile_service.dto.response.UserProfileResponse;
import com.hieu.profile_service.entity.UserProfile;
import com.hieu.profile_service.exception.AppException;
import com.hieu.profile_service.exception.ErrorCode;
import com.hieu.profile_service.mapper.UserProfileMapper;
import com.hieu.profile_service.repository.UserProfileRepository;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {
    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;

    FileService fileService;

    @NonFinal
    @Value("${app.default-avatar.url}")
    private String defaultAvatarUrl;

    @NonFinal
    @Value("${app.default-avatar.key}")
    private String defaultAvatarKey;

    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);

        if(!StringUtils.hasText(request.getFullName())){
            String suffix = RandomStringUtils.randomAlphanumeric(6).toUpperCase();
            userProfile.setFullName("Trader_" + suffix);
        }

        userProfile.setAvatarUrl(defaultAvatarUrl);
        userProfile.setAvatarPath(defaultAvatarKey);

        userProfile = userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public PageResponse<UserProfileResponse> getAllProfiles(Pageable pageable) {
        Sort sort = Sort.by("fullName").ascending();

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), sort);

        var pageData = userProfileRepository.findAll(pageRequest);

        return PageResponse.fromPage(pageData.map(userProfileMapper::toUserProfileResponse));
    }

    public List<UserProfileResponse> getProfilesByUserIds(List<String> userIds) {
        var userProfiles = userProfileRepository.findAllByUserIdIn(userIds);

        return userProfiles.stream().map(userProfileMapper::toUserProfileResponse).toList();
    }

    public UserProfileResponse getProfileByUserId(String userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse updateMyProfile(ProfileUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userProfileMapper.updateProfile(userProfile, request);

        userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse updateAvatar(MultipartFile file) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var fileResponse = fileService.uploadMediaAWS(file, FileType.AVATAR, AccessScope.PUBLIC).getResult();

        if (!userProfile.getAvatarPath().equals(defaultAvatarKey)) {
            try {
                fileService.deleteFileAWS(userProfile.getAvatarPath());
            } catch (FeignException exception) {
                log.info("Error while delete file", exception);
            }
        }
        userProfile.setAvatarUrl(fileResponse.getUrl());
        userProfile.setAvatarPath(fileResponse.getPath());

        userProfile = userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public void deleteProfileByUserId(String userId) {
        userProfileRepository.deleteByUserId(userId);
    }
}
