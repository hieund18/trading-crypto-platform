package com.hieu.identity_service.service;

import com.hieu.identity_service.constant.PredefinedRole;
import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.RoleRequest;
import com.hieu.identity_service.dto.response.RoleResponse;
import com.hieu.identity_service.entity.Permission;
import com.hieu.identity_service.entity.Role;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.mapper.RoleMapper;
import com.hieu.identity_service.repository.PermissionRepository;
import com.hieu.identity_service.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    public RoleResponse createRole(RoleRequest request) {
        Role role = roleMapper.toRole(request);

        if (!CollectionUtils.isEmpty(request.getPermissionId())) {
            List<Permission> permissions = permissionRepository.findAllById(request.getPermissionId());
            role.setPermissions(new HashSet<>(permissions));
        }

        try {
            role = roleRepository.save(role);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<RoleResponse> getRoles(String name, Pageable pageable) {

        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() -1, pageable.getPageSize(), pageable.getSort());

        var pageData = roleRepository.findByNameContainingIgnoreCase(name, pageRequest);

        return PageResponse.fromPage(pageData.map(roleMapper::toRoleResponse));
    }

    public RoleResponse updateRole(Long roleId, RoleRequest request) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

//        String roleName = role.getName();
//        if (roleName.equals(PredefinedRole.ADMIN_ROLE) || roleName.equals(PredefinedRole.USER_ROLE))
//            throw new AppException(ErrorCode.CANNOT_UPDATE_SYSTEM_ROLE);

        roleMapper.updateRole(role, request);

        List<Permission> permissions = permissionRepository.findAllById(request.getPermissionId());
        role.setPermissions(new HashSet<>(permissions));

        try {
            role = roleRepository.save(role);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    public void deleteRole(Long roleId) {
        roleRepository.deleteById(roleId);
    }
}
