package com.heng.roomrental.role.repository;

import com.heng.roomrental.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface RoleRepository
        extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(
            String code
    );

    boolean existsByCode(
            String code
    );

    @Query("select r from Role r left join fetch r.permissions where r.code = :code")
    Optional<Role> findByCodeWithPermissions(String code);
}