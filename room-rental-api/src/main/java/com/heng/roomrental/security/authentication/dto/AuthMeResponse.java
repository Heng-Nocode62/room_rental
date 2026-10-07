package com.heng.roomrental.security.authentication.dto;

import com.heng.roomrental.role.dto.RoleResponse;

import java.util.List;

public record AuthMeResponse(

        Long id,

        String username,

        String firstName,

        String lastName,

        String email,

        String phone,

        String status,
        List<RoleResponse> roles,
        List<NavigationResponse> navigation
) {
}