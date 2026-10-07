package com.heng.roomrental.role.dto;

import com.heng.roomrental.permission.dto.PermissionResponse;

import java.util.List;

public record RoleResponse(

        Long id,

        String code,

        String name,

        String description,

        boolean isActive,

        List<PermissionResponse> permissions
) {
}