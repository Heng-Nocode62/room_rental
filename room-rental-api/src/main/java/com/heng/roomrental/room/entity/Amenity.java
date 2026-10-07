package com.heng.roomrental.room.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.location.entity.Location;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "amenities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_amenities_location_name",
            columnNames = {"location_id", "name"}
        )
    }
)
@Getter
@Setter
@Auditable
public class Amenity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "location_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_amenities_location")
    )
    private Location location;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AmenityStatus status;
}
