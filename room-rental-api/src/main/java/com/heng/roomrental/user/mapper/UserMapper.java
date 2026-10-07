package com.heng.roomrental.user.mapper;

import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.mapper.PermissionMapper;
import com.heng.roomrental.role.dto.RoleResponse;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.user.dto.UserResponse;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {
    private final PermissionMapper permissionMapper;
    public UserResponse toResponse(
            User user
    ) {

        List<RoleResponse> roles =
                user.getRoles()
                        .stream()
                        .map(this::toRoleResponse)
                        .toList();

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus().name(),
                roles
        );
    }


    private RoleResponse toRoleResponse(
            Role role
    ) {

        return new RoleResponse(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                role.isActive(),
                role.getPermissions()
                        .stream()
                        .map(
                                permissionMapper::toResponse
                        )
                        .toList()
        );
    }
}
