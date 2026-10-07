package com.heng.roomrental.permission.service;

import com.heng.roomrental.permission.dto.CreatePermissionRequest;
import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.dto.UpdatePermissionRequest;

import java.util.List;

public interface PermissionService {

    PermissionResponse create(CreatePermissionRequest request);

    PermissionResponse update(Long id, UpdatePermissionRequest request);

    PermissionResponse getById(Long id);

    PermissionResponse getByCode(String code);

    List<PermissionResponse> getAll();

    List<PermissionResponse> getByModuleId(Long moduleId);

    List<PermissionResponse> getByRoleId(Long roleId);

    PermissionResponse deactivate(Long id);

    PermissionResponse activate(Long id);
}
