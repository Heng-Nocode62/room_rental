package com.heng.roomrental.location.dto;

public record UserLocationRoleResponse(
        Long id,
        Long userId,
        Long locationId,
        Long roleId
) {
}