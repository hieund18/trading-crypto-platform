package com.hieu.identity_service.repository;

import com.hieu.identity_service.entity.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByName(String name);

    Page<Permission> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
