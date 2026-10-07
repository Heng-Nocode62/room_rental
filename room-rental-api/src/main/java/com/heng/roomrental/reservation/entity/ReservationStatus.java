package com.heng.roomrental.reservation.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "reservation_statuses",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_reservation_statuses_code",
            columnNames = "code"
        )
    }
)
@Getter
@Setter
@Auditable
public class ReservationStatus {

    @Id
    private Short id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

}