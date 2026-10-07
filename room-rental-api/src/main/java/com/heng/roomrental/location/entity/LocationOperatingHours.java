package com.heng.roomrental.location.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Getter
@Entity
@Table(
        name = "location_operating_hours",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_location_operating_hours_day",
                        columnNames = {
                                "location_id",
                                "day_of_week"
                        }
                )
        }
)
@AllArgsConstructor
@NoArgsConstructor
@Auditable
public class LocationOperatingHours extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "location_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_location_operating_hours_location"
            )
    )
    private Location location;

    @Column(name = "day_of_week", nullable = false)
    private Short dayOfWeek;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(nullable = false)
    private boolean closed;

    public void update(
            LocalTime openTime,
            LocalTime closeTime,
            boolean closed
    ) {
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.closed = closed;
    }

}