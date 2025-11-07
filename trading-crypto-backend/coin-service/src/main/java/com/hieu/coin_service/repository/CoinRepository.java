package com.hieu.coin_service.repository;

import com.hieu.coin_service.entity.Coin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoinRepository extends MongoRepository<Coin, String> {

    Page<Coin> findAll(Pageable pageable);

    List<Coin> findByIdIn(List<String> ids);

    List<Coin> findByIdInAndIsActiveTrue(List<String> ids);

    Page<Coin> findByNameContainingIgnoreCaseAndIsActive(String keyword, Boolean isActive, Pageable pageable);
}
