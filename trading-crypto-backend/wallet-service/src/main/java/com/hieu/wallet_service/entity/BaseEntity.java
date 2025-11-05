package com.hieu.wallet_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@MappedSuperclass
public class BaseEntity {
    @Column(name = "created_at")
    Instant createdAt;

//    @Column(name = "updated_at")
//    Instant updatedAt;

    @PrePersist
    protected void onCreate(){
        this.createdAt = Instant.now();
//        this.updatedAt = Instant.now();
    }

//    @PreUpdate
//    protected void onUpdate(){
//        this.updatedAt = Instant.now();
//    }
}
