package com.hieu.identity_service.service;

import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.PermissionRequest;
import com.hieu.identity_service.dto.response.PermissionResponse;
import com.hieu.identity_service.entity.Permission;
import com.hieu.identity_service.exception.AppException;
import com.hieu.identity_service.exception.ErrorCode;
import com.hieu.identity_service.mapper.PermissionMapper;
import com.hieu.identity_service.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse createPermission(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);

        try {
            permission = permissionRepository.save(permission);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.PERMISSION_EXISTED);
        }

        return permissionMapper.toPermissionResponse(permission);
    }

    public PageResponse<PermissionResponse> getPermissions(int page, int size) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("name").ascending());

        var pageData = permissionRepository.findAll(pageable);

        return PageResponse.fromPage(pageData.map(permissionMapper::toPermissionResponse));
    }

    public PageResponse<PermissionResponse> searchByName(String keyword, Pageable pageable) {

//        Sort sort = Sort.by("name").ascending();
        Pageable pageRequest = PageRequest.of(pageable.getPageNumber() - 1, pageable.getPageSize(), pageable.getSort());

        var pageData = permissionRepository.findByNameContainingIgnoreCase(keyword, pageRequest);

//        return PageResponse.<PermissionResponse>builder()
//                .currentPage(pageableDefault.page())
//                .sizePage(pageData.getSize())
//                .totalPages(pageData.getTotalPages())
//                .totalElements(pageData.getTotalElements())
//                .data(pageData.getContent().stream().map(permissionMapper::toPermissionResponse).toList())
//                .build();

        return PageResponse.fromPage(pageData.map(permissionMapper::toPermissionResponse));
    }

    public void deletePermission(Long id) {
        permissionRepository.deleteById(id);
    }
}
