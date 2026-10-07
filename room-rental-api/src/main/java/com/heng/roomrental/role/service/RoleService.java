package com.heng.roomrental.role.service;

import com.heng.roomrental.role.dto.CreateRoleRequest;
import com.heng.roomrental.role.dto.RoleResponse;
import com.heng.roomrental.role.dto.UpdateRoleRequest;

import java.util.List;
import java.util.Set;

public interface RoleService {

    RoleResponse create(
            CreateRoleRequest request
    );

    RoleResponse getById(
            Long id
    );

    List<RoleResponse> getAll();

    RoleResponse update(
            Long id,
            UpdateRoleRequest request
    );


    RoleResponse assignPermissions(
            Long roleId,
            Set<Long> permissionIds
    );
    RoleResponse deactivate(
            Long id
    );

    RoleResponse activate(
            Long id
    );
}