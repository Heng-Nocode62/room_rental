package com.heng.roomrental.reservation.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "room_blocks",
        indexes = {
                @Index(
                        name = "idx_room_blocks_room_time",
                        columnList = "room_id,start_at,end_at"
                ),
                @Index(
                        name = "idx_room_blocks_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@Auditable
public class RoomBlock extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "block_type",
            nullable = false,
            length = 30
    )
    private RoomBlockType blockType;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private RoomBlockStatus status;

    @Column(
            name = "start_at",
            nullable = false
    )
    private OffsetDateTime startAt;

    @Column(
            name = "end_at",
            nullable = false
    )
    private OffsetDateTime endAt;

    @Column(length = 255)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by",
            nullable = false
    )
    private User createdBy;


}