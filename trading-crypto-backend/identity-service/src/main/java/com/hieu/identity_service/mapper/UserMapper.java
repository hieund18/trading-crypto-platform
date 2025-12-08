package com.hieu.identity_service.mapper;

import com.hieu.identity_service.dto.request.UserCreationRequest;
import com.hieu.identity_service.dto.response.UserResponse;
import com.hieu.identity_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", ignore = true)
    User toUser(UserCreationRequest userCreationRequest);

    UserResponse toUserResponse(User user);
}
