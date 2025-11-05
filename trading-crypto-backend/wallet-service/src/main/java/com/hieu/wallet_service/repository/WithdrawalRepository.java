package com.hieu.wallet_service.repository;

import com.hieu.wallet_service.entity.Withdrawal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, String> {
    List<Withdrawal> findAllByUserIdAndStatus(String userId, String status);

    Page<Withdrawal> findAllByUserIdAndStatusNot(String userId, String status, Pageable pageable);

    Page<Withdrawal> findAllByStatusNot(String status, Pageable pageable);
}
