package com.hieu.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "trade_histories")
public class TradeHistory extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "coin_id", nullable = false)
    String coinId;

    String type;

    @Column(nullable = false)
    Double quantity;

    @Column(nullable = false)
    Double price;

    @Column(nullable = false)
    Double amount;
}
