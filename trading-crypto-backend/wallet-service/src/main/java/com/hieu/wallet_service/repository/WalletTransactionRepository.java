package com.hieu.wallet_service.repository;

import com.hieu.wallet_service.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, String> {
    @Query("""
        SELECT w FROM WalletTransaction w
        WHERE w.userId = :userId
          AND (:type IS NULL OR w.type LIKE CONCAT(:type, '%'))
    """)
    Page<WalletTransaction> findAllByUserIdAndType(
            Pageable pageable,
            @Param("userId") String userId,
            @Param("type") String type
    );

    @Query("""
    SELECT w FROM WalletTransaction w
    WHERE 
        (
            :keyword IS NULL 
            OR :keyword = '' 
            OR w.userId = :keyword
            OR w.id = :keyword
        )
        AND (
            :type IS NULL 
            OR :type = '' 
            OR w.type LIKE CONCAT(:type, '%')
        )
    """)
    Page<WalletTransaction> searchTransactions(
            Pageable pageable,
            @Param("keyword") String keyword,
            @Param("type") String type
    );
}
