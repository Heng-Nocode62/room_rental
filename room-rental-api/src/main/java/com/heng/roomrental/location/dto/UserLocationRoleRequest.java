package com.heng.roomrental.location.dto;

public record UserLocationRoleRequest(
        Long userId,
        Long locationId,
        Long roleId
) {
}