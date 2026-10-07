package com.heng.roomrental.permission.controller;

import com.heng.roomrental.permission.dto.CreatePermissionRequest;
import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.dto.UpdatePermissionRequest;
import com.heng.roomrental.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    public PermissionResponse create(@RequestBody CreatePermissionRequest request) {
        return permissionService.create(request);
    }

    @PutMapping("/{id}")
    public PermissionResponse update(
            @PathVariable Long id,
            @RequestBody UpdatePermissionRequest request
    ) {
        return permissionService.update(id, request);
    }

    @GetMapping("/{id}")
    public PermissionResponse getById(@PathVariable Long id) {
        return permissionService.getById(id);
    }

    @GetMapping
    public List<PermissionResponse> getAll() {
        return permissionService.getAll();
    }

    @GetMapping("/module/{moduleId}")
    public List<PermissionResponse> getByModuleId(@PathVariable Long moduleId) {
        return permissionService.getByModuleId(moduleId);
    }

    @GetMapping("/role/{roleId}")
    public List<PermissionResponse> getByRoleId(@PathVariable Long roleId) {
        return permissionService.getByRoleId(roleId);
    }

    @PatchMapping("/{id}/deactivate")
    public PermissionResponse deactivate(@PathVariable Long id) {
        return permissionService.deactivate(id);
    }

    @PatchMapping("/{id}/activate")
    public PermissionResponse activate(@PathVariable Long id) {
        return permissionService.activate(id);
    }
}
