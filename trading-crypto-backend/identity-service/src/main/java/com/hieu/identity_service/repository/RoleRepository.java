package com.hieu.identity_service.repository;

import java.util.Optional;

import com.hieu.identity_service.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    Page<Role> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
