package com.heng.roomrental.permission.dto;

public record UpdatePermissionRequest(
        String code,
        String name,
        String description,
        Long moduleId
) {
}
