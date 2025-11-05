package com.hieu.wallet_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    String type;

    @Column(nullable = false)
    BigDecimal amount;

    @Column(name = "balance_before")
    BigDecimal balanceBefore;

    @Column(name = "balance_after")
    BigDecimal balanceAfter;
}
