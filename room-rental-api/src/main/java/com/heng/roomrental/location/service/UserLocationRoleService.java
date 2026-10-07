package com.heng.roomrental.location.service;

import com.heng.roomrental.location.dto.UserLocationRoleRequest;
import com.heng.roomrental.location.dto.UserLocationRoleResponse;

import java.util.List;

public interface UserLocationRoleService {

    UserLocationRoleResponse create(UserLocationRoleRequest request);

    UserLocationRoleResponse update(
            Long id,
            UserLocationRoleRequest request
    );

    UserLocationRoleResponse getById(Long id);

    List<UserLocationRoleResponse> getAll();

    List<UserLocationRoleResponse> getByUserId(Long userId);

    List<UserLocationRoleResponse> getByLocationId(Long locationId);

    List<UserLocationRoleResponse> getByUserAndLocation(
            Long userId,
            Long locationId
    );

    boolean hasPermissionAtLocation(
            Long userId,
            Long locationId,
            String permissionCode
    );

    void delete(Long id);
}