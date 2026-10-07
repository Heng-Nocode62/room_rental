package com.heng.roomrental.location.entity;

import com.heng.roomrental.user.entity.User;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.role.entity.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "user_location_roles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_location_role",
                        columnNames = {"user_id", "location_id", "role_id"}
                )
        }
)
@Getter
@Setter
@Auditable
public class UserLocationRole extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}