package com.hieu.identity_service.scheduler;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.hieu.identity_service.entity.User;
import com.hieu.identity_service.repository.UserRepository;
import com.hieu.identity_service.service.ProfileService;
import com.hieu.identity_service.service.WalletService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserCleanupScheduler {
    UserRepository userRepository;
    ProfileService profileService;
    WalletService walletService;

    @Scheduled(cron = "${app.scheduler.delete-unverified-users-cron}")
    public void cleanupUnverifiedUsers() {
        Instant expiryTime = Instant.now().minus(1, ChronoUnit.DAYS);
        List<User> unverifiedUsers = userRepository.findAllByEmailVerifiedFalseAndCreatedAtBefore(expiryTime);
        log.info("Deleted unverified user with userId: ");
        unverifiedUsers.forEach(user -> {
            try {
                profileService.deleteProfileByUserId(user.getId());
                walletService.deleteWalletByUserId(user.getId());
                userRepository.delete(user);
                log.info("Deleted unverified user with userId: {}", user.getId());
            } catch (Exception exception) {
                log.error("Failed to delete user with userId: {}", user.getId(), exception);
            }
        });
    }
}
