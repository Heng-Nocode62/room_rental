package com.heng.roomrental.room.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.location.entity.Location;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "room_types",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_room_types_code",
            columnNames = "code"
        )
    }
)
@Getter
@Setter
@Auditable
public class RoomType extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer capacity;
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomTypeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

}