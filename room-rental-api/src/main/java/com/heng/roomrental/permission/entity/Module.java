package com.heng.roomrental.permission.entity;

import com.heng.roomrental.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(
        name = "modules",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_modules_name",
                        columnNames = "name"
                )
        }
)
@Getter
@Setter
public class Module extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private boolean isActive = true;

    @OneToMany(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            mappedBy = "module"
    )
    private List<Permission> permissions;
}
