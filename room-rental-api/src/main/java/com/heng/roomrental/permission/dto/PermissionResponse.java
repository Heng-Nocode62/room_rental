package com.heng.roomrental.permission.dto;

public record PermissionResponse(
        Long id,
        String code,
        String name,
        String description,
        Long moduleId,
        boolean isActive
) {
}
