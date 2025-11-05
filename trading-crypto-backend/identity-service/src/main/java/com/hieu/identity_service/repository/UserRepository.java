package com.hieu.identity_service.repository;

import com.hieu.identity_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleAccountId(String googleAccountId);

    Optional<User> findByGithubAccountId(String githubAccountId);

    List<User> findAllByEmailVerifiedFalseAndCreatedAtBefore(Instant time);

    boolean existsByEmail(String email);

    Page<User> findByUsernameContainingIgnoreCase(Pageable pageable, String keyword);
}
