package com.hieu.identity_service.configuration;

import com.hieu.identity_service.constant.PredefinedPermission;
import com.hieu.identity_service.entity.Permission;
import com.hieu.identity_service.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionSeeder implements ApplicationRunner {

    PermissionRepository permissionRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
//        log.info("Seeding default permission");

        var permissions = List.of(
                PredefinedPermission.APPROVE_POST,
                PredefinedPermission.CREATE_POST,
                PredefinedPermission.REJECT_POST
        );

        permissions.forEach(s -> {
            if (!permissionRepository.existsByName(s)){
                permissionRepository.save(Permission.builder()
                        .name(s)
                        .build());
            }
        });
    }
}
