CREATE DATABASE identity_service1;
USE identity_service1;

CREATE TABLE users(
	id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE COLLATE utf8mb4_unicode_ci,
    password VARCHAR(100),
    email VARCHAR(100) UNIQUE COLLATE utf8mb4_unicode_ci,
    email_verified TINYINT(1) DEFAULT 0 NOT NULL,
    is_active TINYINT(1) DEFAULT 0 NOT NULL,
    two_factor_enabled TINYINT(1) DEFAULT 0 NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    google_account_id VARCHAR(255) UNIQUE,
    github_account_id VARCHAR(255) UNIQUE,
    token_version INT NOT NULL
);

-- alter table users add column two_factor_enabled tinyint(1) default 0 not null;

CREATE TABLE roles(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users_roles(
	user_id VARCHAR(50),
    role_id INT,
    CONSTRAINT pk_user_roles PRIMARY KEY(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE permissions(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE roles_permissions(
	role_id INT,
    permission_id INT,
    CONSTRAINT pk_role_permissions PRIMARY KEY(role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

-- CREATE TABLE invalidated_tokens(
-- 	id VARCHAR(50) PRIMARY KEY,
--     expiry_time DATETIME
-- );

CREATE TABLE refresh_tokens(
	id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    issue_time DATETIME NOT NULL,
    expiry_time DATETIME NOT NULL
   --  is_revoked TINYINT(1) DEFAULT 0 NOT NULL
);

CREATE TABLE reset_tokens(
	id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    expiry_time DATETIME NOT NULL
);

--  private Long id;

--     private String token; // mã OTP

--     private String email; // hoặc userId nếu cần

--     @Enumerated(EnumType.STRING)
--     private OtpType type; // REGISTER, TRANSACTION, LOGIN_2FA

--     private LocalDateTime expiryDate;

--     private boolean used = false;

--     private int resendCount = 0;

--     private LocalDateTime createdAt;