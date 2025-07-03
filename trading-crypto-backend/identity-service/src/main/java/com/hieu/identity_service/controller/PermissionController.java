package com.hieu.identity_service.controller;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.PermissionRequest;
import com.hieu.identity_service.dto.response.PermissionResponse;
import com.hieu.identity_service.service.PermissionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> createPermission(@RequestBody @Valid PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.createPermission(request))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<PermissionResponse>> getPermissions(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<PermissionResponse>>builder()
                .result(permissionService.getPermissions(page, size))
                .build();
    }

    @GetMapping("/search")
    ApiResponse<PageResponse<PermissionResponse>> searchByName(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @PageableDefault(page = 1, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ApiResponse.<PageResponse<PermissionResponse>>builder()
                .result(permissionService.searchByName(keyword, pageable))
                .build();
    }

    @DeleteMapping("/{id}")
    ApiResponse<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);

        return ApiResponse.<Void>builder().build();
    }
}
