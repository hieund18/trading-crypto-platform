package com.hieu.coin_service.repository;

import com.hieu.coin_service.entity.Coin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoinRepository extends MongoRepository<Coin, String> {

    Page<Coin> findAll(Pageable pageable);

    List<Coin> findByIdIn(List<String> ids);

    List<Coin> findByIdInAndIsActiveTrue(List<String> ids);

    @Query("{ " +
            "  $or: [ " +
            "    { 'name': { $regex: ?0, $options: 'i' } }, " +
            "    { 'symbol': { $regex: ?0, $options: 'i' } } " +
            "  ], " +
            "  'isActive': ?#{ [1] != null ? [1] : { $exists: true } } " +
            "}")
    Page<Coin> search(String keyword, Boolean isActive, Pageable pageable);

    List<Coin> findByIsActiveTrue();

    Page<Coin> findByTrendingRankNotNullAndIsActiveTrue(Pageable pageable);

    List<Coin> findByTrendingRankNotNull();

    Page<Coin> findByIsActive(Boolean isActive, Pageable pageable);

    List<Coin> findByBinanceSymbolInAndIsActiveTrue(List<String> symbols);

    boolean existsByBinanceSymbol(String binanceSymbol);

    Optional<Coin> findByBinanceSymbol(String binanceSymbol);
}
