package com.heng.roomrental.role.controller;

import com.heng.roomrental.role.dto.*;
import com.heng.roomrental.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse create(
            @Valid
            @RequestBody
            CreateRoleRequest request
    ) {

        return roleService.create(
                request
        );
    }


    @GetMapping
    public List<RoleResponse> getAll() {

        return roleService.getAll();
    }


    @GetMapping("/{id}")
    public RoleResponse getById(
            @PathVariable Long id
    ) {

        return roleService.getById(id);
    }


    @PutMapping("/{id}")
    public RoleResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateRoleRequest request
    ) {

        return roleService.update(
                id,
                request
        );
    }


    @PutMapping("/{id}/permissions")
    public RoleResponse assignPermissions(
            @PathVariable Long id,

            @Valid
            @RequestBody
            AssignPermissionsRequest request
    ) {

        return roleService.assignPermissions(
                id,
                request.permissionIds()
        );
    }


    @PatchMapping("/{id}/deactivate")
    public RoleResponse deactivate(
            @PathVariable Long id
    ) {

        return roleService.deactivate(id);
    }


    @PatchMapping("/{id}/activate")
    public RoleResponse activate(
            @PathVariable Long id
    ) {

        return roleService.activate(id);
    }
}