package com.hieu.coin_service.repository;

import java.util.List;

import com.hieu.coin_service.entity.Watchlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchlistRepository extends MongoRepository<Watchlist, String> {
    Page<Watchlist> findAllByUserId(Pageable pageable, String userId);

    List<Watchlist> findAllByUserId(String userId);

    void deleteByUserIdAndCoinId(String userId, String coinId);
}
