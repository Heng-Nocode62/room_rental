package com.heng.roomrental.reservation.entity;

import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.room.entity.Amenity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "reservation_amenities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_reservation_amenity",
            columnNames = {"reservation_id", "amenity_id"}
        )
    }
)
@Getter
@Setter
public class ReservationAmenity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "reservation_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservation_amenities_reservation")
    )
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "amenity_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservation_amenities_amenity")
    )
    private Amenity amenity;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;
}