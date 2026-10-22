package com.heng.roomrental.location.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "locations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_locations_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@Auditable
public class Location extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 30)
    private String phone;

    @Column(name = "time_zone", nullable = false, length = 64)
    private String timeZone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LocationStatus status;

    @Column(nullable = false)
    private Integer floor;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "location_bakong_account_id", length = 100)
    private String locationBakongAccountId;

    @Column(name = "telegram_contact", length = 255)
    private String telegramContact;
}