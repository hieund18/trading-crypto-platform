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
@Table(name = "withdrawals")
public class Withdrawal extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "bank_name", nullable = false)
    String bankName;

    @Column(name = "bank_account", nullable = false)
    String bankAccount;

    @Column(nullable = false)
    BigDecimal amount;

    String status;
}
