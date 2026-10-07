package com.heng.roomrental.room.entity;


import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.location.entity.Location;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "rooms",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_rooms_location_number",
            columnNames = {"location_id", "room_number"}
        )
    }
)
@Getter
@Setter
@Auditable
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "location_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_rooms_location")
    )
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "room_type_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_rooms_room_type")
    )
    private RoomType roomType;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String floor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;

    @OneToMany(
        mappedBy = "room",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<RoomAmenity> amenities = new ArrayList<>();
}
