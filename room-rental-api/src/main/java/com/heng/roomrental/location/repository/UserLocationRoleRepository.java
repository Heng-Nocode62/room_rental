package com.heng.roomrental.location.repository;

import com.heng.roomrental.location.entity.UserLocationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserLocationRoleRepository extends JpaRepository<UserLocationRole, Long> {

    // Used at login to build the in-memory locationId -> permission codes map.
    @Query("""
        SELECT ulr.location.id AS locationId, p.code AS permissionCode
        FROM UserLocationRole ulr
        JOIN ulr.role.permissions p
        WHERE ulr.user.id = :userId
    """)
    List<LocationPermissionRow> findAllPermissionsForUser(@Param("userId") Long userId);

    // Fallback / non-cached check, straight against the DB.
    @Query("""
        SELECT COUNT(ulr) > 0
        FROM UserLocationRole ulr
        JOIN ulr.role.permissions p
        WHERE ulr.user.id = :userId
          AND ulr.location.id = :locationId
          AND p.code = :permissionCode
    """)
    boolean hasPermissionAtLocation(@Param("userId") Long userId,
                                     @Param("locationId") Long locationId,
                                     @Param("permissionCode") String permissionCode);

    interface LocationPermissionRow {
        Long getLocationId();
        String getPermissionCode();
    }

    List<UserLocationRole> findByUserId(Long userId);

    List<UserLocationRole> findByLocationId(Long locationId);

    List<UserLocationRole> findByUserIdAndLocationId(
            Long userId,
            Long locationId
    );

    boolean existsByUserIdAndLocationIdAndRoleId(
            Long userId,
            Long locationId,
            Long roleId
    );

}