package com.hieu.profile_service.mapper;

import com.hieu.profile_service.dto.request.ProfileCreationRequest;
import com.hieu.profile_service.dto.request.ProfileUpdateRequest;
import com.hieu.profile_service.dto.response.UserProfileResponse;
import com.hieu.profile_service.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toUserProfile(ProfileCreationRequest request);

    @Mapping(source = "avatarUrl", target = "avatar")
    UserProfileResponse toUserProfileResponse(UserProfile userProfile);

    void updateProfile(@MappingTarget UserProfile userProfile, ProfileUpdateRequest request);
}
