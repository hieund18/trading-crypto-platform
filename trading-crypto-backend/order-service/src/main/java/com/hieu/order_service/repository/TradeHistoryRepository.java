package com.hieu.order_service.repository;

import com.hieu.order_service.dto.response.CoinVolumeRankingResponse;
import com.hieu.order_service.dto.response.UserVolumeRankingResponse;
import com.hieu.order_service.entity.TradeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface TradeHistoryRepository extends JpaRepository<TradeHistory, String> {

    @Query("""
        SELECT th FROM TradeHistory th
        WHERE th.userId = :userId
          AND (:type IS NULL OR th.type = :type)
    """)
    Page<TradeHistory> findAllByUserIdAndType(
            Pageable pageable,
            @Param("userId") String userId,
            @Param("type") String type
    );

    List<TradeHistory> findByCreatedAtBetween(Instant from, Instant to);

    @Query("""
        SELECT new com.hieu.order_service.dto.response.UserVolumeRankingResponse(
            t.userId,
            SUM(t.amount),
            COUNT(t.id)
        )
        FROM TradeHistory t
        WHERE t.createdAt BETWEEN :from AND :to
        GROUP BY t.userId
        ORDER BY SUM(t.amount) DESC
    """)
    List<UserVolumeRankingResponse> getUserRanking(Instant from, Instant to);

    @Query("""
        SELECT new com.hieu.order_service.dto.response.CoinVolumeRankingResponse(
            t.coinId,
            SUM(t.amount),
            COUNT(t.id)
        )
        FROM TradeHistory t
        WHERE t.createdAt BETWEEN :from AND :to
        GROUP BY t.coinId
        ORDER BY SUM(t.amount) DESC
    """)
    List<CoinVolumeRankingResponse> getCoinRanking(Instant from, Instant to);

    @Query(value = """
        SELECT DATE_FORMAT(t.created_at, '%Y-%m-%d %H:00') AS period,
               SUM(t.amount) AS totalVolume,
               COUNT(t.id) AS transactionCount
        FROM trade_histories t
        WHERE t.created_at >= :start AND t.created_at < :end
        GROUP BY DATE_FORMAT(t.created_at, '%Y-%m-%d %H:00')
        ORDER BY period
    """, nativeQuery = true)
    List<Object[]> volumeByHour(
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query(value = """
        SELECT DATE_FORMAT(t.created_at, '%Y-%m-%d') AS period,
               SUM(t.amount) AS totalVolume,
               COUNT(t.id) AS transactionCount
        FROM trade_histories t
        WHERE t.created_at >= :start AND t.created_at < :end
        GROUP BY DATE_FORMAT(t.created_at, '%Y-%m-%d')
        ORDER BY period
    """, nativeQuery = true)
    List<Object[]> volumeByDay(
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query(value = """
        SELECT DATE_FORMAT(t.created_at, '%Y-%m') AS period,
               SUM(t.amount) AS totalVolume,
               COUNT(t.id) AS transactionCount
        FROM trade_histories t
        WHERE t.created_at >= :start AND t.created_at < :end
        GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
        ORDER BY period
    """, nativeQuery = true)
    List<Object[]> volumeByMonth(
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
