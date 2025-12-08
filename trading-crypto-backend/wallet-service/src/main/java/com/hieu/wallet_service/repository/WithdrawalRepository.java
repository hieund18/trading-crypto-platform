package com.hieu.wallet_service.repository;

import com.hieu.wallet_service.entity.Withdrawal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, String> {
    List<Withdrawal> findAllByUserIdAndStatus(String userId, String status);

    Page<Withdrawal> findAllByUserIdAndStatusNot(String userId, String status, Pageable pageable);

    Page<Withdrawal> findAllByStatusNot(String status, Pageable pageable);

    @Query("""
    SELECT w FROM Withdrawal w
    WHERE
        w.status <> :notStatus
        AND (
              :status IS NULL
              OR w.status = :status
        )
        AND (
              :keyword IS NULL
              OR :keyword = ''
              OR w.userId = :keyword
              OR w.id = :keyword
        )
    """)
    Page<Withdrawal> searchWithdrawals(
            Pageable pageable,
            @Param("notStatus") String notStatus,
            @Param("status") String status,     // optional
            @Param("keyword") String keyword      // optional
    );
}
