package com.hieu.wallet_service.repository;

import com.hieu.wallet_service.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, String> {
    Optional<Transfer> findByFromUserId(String fromUserId);
}
