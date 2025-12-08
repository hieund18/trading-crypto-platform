package com.hieu.identity_service.controller;

import com.hieu.identity_service.dto.ApiResponse;
import com.hieu.identity_service.dto.PageResponse;
import com.hieu.identity_service.dto.request.RoleRequest;
import com.hieu.identity_service.dto.response.RoleResponse;
import com.hieu.identity_service.service.RoleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<RoleResponse>> getRoles(
            @RequestParam(required = false, defaultValue = "") String name,
            @PageableDefault(page = 1, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.<PageResponse<RoleResponse>>builder()
                .result(roleService.getRoles(name, pageable))
                .build();
    }

    @PutMapping("/{roleId}")
    ApiResponse<RoleResponse> updateRole(@PathVariable Long roleId, @RequestBody @Valid RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(roleId, request))
                .build();
    }

    @DeleteMapping("/{roleId}")
    ApiResponse<Void> deleteRole(@PathVariable Long roleId) {
        roleService.deleteRole(roleId);

        return ApiResponse.<Void>builder().build();
    }
}
