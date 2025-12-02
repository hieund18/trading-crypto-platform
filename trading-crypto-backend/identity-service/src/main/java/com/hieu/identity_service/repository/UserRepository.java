package com.hieu.identity_service.repository;

import com.hieu.identity_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    boolean existsByEmailAndEmailVerifiedTrue(String email);

    Page<User> findByUsernameContainingIgnoreCase(Pageable pageable, String keyword);

    @Query("""
    SELECT DISTINCT u FROM users u
    LEFT JOIN u.roles r
    WHERE (:isActive IS NULL OR u.isActive = :isActive)
      AND (
           :keyword IS NULL 
        OR :keyword = '' 
        OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(u.id) LIKE LOWER(CONCAT('%', :keyword, '%'))
      )
      AND (
           :roleId IS NULL 
        OR r.id = :roleId
      )
    """)
    Page<User> searchUsers(
            Pageable pageable,
            @Param("isActive") Boolean isActive,
            @Param("keyword") String keyword,
            @Param("roleId") Long roleId
    );

}
