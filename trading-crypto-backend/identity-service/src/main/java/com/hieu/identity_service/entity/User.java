package com.hieu.identity_service.entity;

import java.util.Set;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "users")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(unique = true, columnDefinition = "VARCHAR(50) COLLATE utf8mb4_unicode_ci")
    String username;

    String password;

    @Column(unique = true, columnDefinition = "VARCHAR(100) COLLATE utf8mb4_unicode_ci")
    String email;

    @Column(name = "email_verified", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    Boolean emailVerified;

    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    Boolean isActive;

    @Column(name = "two_factor_enabled", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    Boolean twoFactorEnabled;

    @Column(name = "google_account_id", unique = true)
    String googleAccountId;

    @Column(name = "github_account_id", unique = true)
    String githubAccountId;

    @Column(name = "token_version", nullable = false)
    long tokenVersion;

    @ManyToMany
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Role> roles;
}
