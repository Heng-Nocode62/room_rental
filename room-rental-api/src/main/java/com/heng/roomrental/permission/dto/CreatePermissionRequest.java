package com.heng.roomrental.permission.dto;

public record CreatePermissionRequest(
        String code,
        String name,
        String description,
        Long moduleId
) {
}
