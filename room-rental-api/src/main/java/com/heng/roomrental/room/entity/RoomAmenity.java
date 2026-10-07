package com.heng.roomrental.room.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "room_amenities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_room_amenities_room_amenity",
            columnNames = {"room_id", "amenity_id"}
        )
    }
)
@Getter
@Setter
@Auditable
public class RoomAmenity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "room_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_room_amenities_room")
    )
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "amenity_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_room_amenities_amenity")
    )
    private Amenity amenity;

    @Column(nullable = false)
    private Integer amount;
}
