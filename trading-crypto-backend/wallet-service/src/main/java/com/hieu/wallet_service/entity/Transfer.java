package com.hieu.wallet_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "transfers")
public class Transfer extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "from_user_id", nullable = false)
    String fromUserId;

    @Column(name = "to_user_id", nullable = false)
    String toUserId;

    @Column(nullable = false)
    BigDecimal amount;
}
