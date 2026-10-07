package com.heng.roomrental.user.dto;

import com.heng.roomrental.role.dto.RoleResponse;

import java.util.List;

public record UserResponse(

        Long id,

        String username,

        String firstName,

        String lastName,

        String email,

        String phone,

        String status,

        List<RoleResponse> roles
) {
}