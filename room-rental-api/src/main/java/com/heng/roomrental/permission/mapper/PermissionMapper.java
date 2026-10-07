package com.heng.roomrental.permission.mapper;

import com.heng.roomrental.permission.dto.CreatePermissionRequest;
import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.dto.UpdatePermissionRequest;
import com.heng.roomrental.permission.entity.Permission;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {

    public Permission toEntity(CreatePermissionRequest request) {
        Permission permission = new Permission();
        permission.setCode(request.code());
        permission.setName(request.name());
        permission.setDescription(request.description());
        permission.setActive(true);
        return permission;
    }

    public void updateEntity(UpdatePermissionRequest request, Permission permission) {
        permission.setCode(request.code());
        permission.setName(request.name());
        permission.setDescription(request.description());
    }

    public PermissionResponse toResponse(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getCode(),
                permission.getName(),
                permission.getDescription(),
                permission.getModule() == null ? null : permission.getModule().getId(),
                permission.isActive()
        );
    }
}
