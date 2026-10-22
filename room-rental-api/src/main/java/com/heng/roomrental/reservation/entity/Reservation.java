package com.heng.roomrental.reservation.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.pricing.entity.PricingUnit;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "reservations",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_reservations_reference",
            columnNames = "reference_no"
        )
    }
)
@Getter
@Setter
@Auditable
public class Reservation extends BaseEntity {

    @Column(name = "reference_no", nullable = false, length = 50)
    private String referenceNo;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "room_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservations_room")
    )
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "reserved_by",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservations_reserved_by")
    )
    private User reservedBy;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "status_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservations_status")
    )
    private ReservationStatus status;

    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(
        name = "pricing_unit_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_reservations_pricing_unit")
    )
    private PricingUnit pricingUnit;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(length = 255)
    private String purpose;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "cancelled_by",
        foreignKey = @ForeignKey(name = "fk_reservations_cancelled_by")
    )
    private User cancelledBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "confirmed_by",
            foreignKey = @ForeignKey(name = "fk_reservations_confirmed_by")
    )
    private User confirmedBy;



    @OneToMany(
            mappedBy = "reservation",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ReservationAmenity> amenities = new ArrayList<>();

}