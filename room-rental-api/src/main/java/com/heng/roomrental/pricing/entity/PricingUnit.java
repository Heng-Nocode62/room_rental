package com.heng.roomrental.pricing.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "pricing_units",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_pricing_units_code",
            columnNames = "code"
        )
    }
)
@Getter
@Setter

public class PricingUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

}