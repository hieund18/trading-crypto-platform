package com.hieu.wallet_service.repository;

import com.hieu.wallet_service.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, String> {
    Page<WalletTransaction> findAllByUserId(Pageable pageable, String userId);
}
