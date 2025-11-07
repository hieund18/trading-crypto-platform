package com.hieu.order_service.repository;

import com.hieu.order_service.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String> {

    Page<Asset> findAllByUserId(Pageable pageable, String userId);

    List<Asset> findAllByUserId(String userId);

    Optional<Asset> findByUserIdAndCoinId(String userId, String coinId);
}
