package com.hieu.identity_service.configuration;

import com.hieu.identity_service.constant.PredefinedRole;
import com.hieu.identity_service.dto.request.UserCreationRequest;
import com.hieu.identity_service.entity.Role;
import com.hieu.identity_service.entity.User;
import com.hieu.identity_service.repository.RoleRepository;
import com.hieu.identity_service.repository.UserRepository;
import com.hieu.identity_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USERNAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driver-class-name",
            havingValue = "com.mysql.cj.jdbc.Driver"
    )
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository, UserService userService) {
        log.info("Initializing application...");

        return args -> {
            if (userRepository.findByUsername(ADMIN_USERNAME).isEmpty()) {
                Role adminRole = roleRepository.save(Role.builder()
                        .name(PredefinedRole.ADMIN_ROLE)
                        .build());

                roleRepository.save(Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .build());

                //
                try {
                    var response = userService.createUser(UserCreationRequest.builder()
                            .username(ADMIN_USERNAME)
                            .password(ADMIN_PASSWORD)
                            .email("admin@bitstorm.store")
                            .build());

                    User user = userRepository.findById(response.getId()).orElse(null);
                    if(user != null){
                        user.setEmailVerified(true);
                        user.setIsActive(true);
                        user.setRoles(Set.of(adminRole));

                        userRepository.save(user);
                    }
                }catch (Exception exception){
                    log.warn("Cannot create admin user");
                }

//                userRepository.save(User.builder()
//                        .username(ADMIN_USERNAME)
//                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
//                        .emailVerified(false)
//                        .isActive(true)
//                        .twoFactorEnabled(false)
//                        .roles(Set.of(adminRole))
//                        .build());

                log.warn("Admin user has been created with default password: admin, please change it");
            }

            log.info("Application initialization completed...");
        };
    }
}
