package com.heng.roomrental.role.entity;

import com.heng.roomrental.audit.annotation.Auditable;
import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.permission.entity.Permission;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "roles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_roles_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
@Auditable
public class Role extends BaseEntity {
    @Column(
            nullable = false,
            length = 50
    )
    private String code;

    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permissions",

            joinColumns = @JoinColumn(
                    name = "role_id"
            ),

            inverseJoinColumns = @JoinColumn(
                    name = "permission_id"
            )
    )
    @Column(nullable = false)

    private Set<Permission> permissions =
            new HashSet<>();

    private boolean isActive = true;
}