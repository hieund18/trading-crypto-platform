package com.hieu.coin_service.repository;

import com.hieu.coin_service.entity.BinanceSymbolMaster;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BinanceSymbolMasterRepository extends MongoRepository<BinanceSymbolMaster, String> {
    Page<BinanceSymbolMaster> findBySymbolContainingIgnoreCase(Pageable pageable, String symbol);
}
