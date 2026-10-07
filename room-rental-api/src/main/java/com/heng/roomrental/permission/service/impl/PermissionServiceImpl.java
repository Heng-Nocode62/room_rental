package com.heng.roomrental.permission.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.permission.dto.CreatePermissionRequest;
import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.dto.UpdatePermissionRequest;
import com.heng.roomrental.permission.entity.Module;
import com.heng.roomrental.permission.entity.Permission;
import com.heng.roomrental.permission.mapper.PermissionMapper;
import com.heng.roomrental.permission.repository.ModuleRepository;
import com.heng.roomrental.permission.repository.PermissionRepository;
import com.heng.roomrental.permission.service.PermissionService;
import com.heng.roomrental.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final ModuleRepository moduleRepository;
    private final PermissionMapper permissionMapper;
    private final RoleRepository roleRepository;

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
    @Transactional
    public PermissionResponse create(CreatePermissionRequest request) {
        if (permissionRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Permission already exists: " + request.code());
        }

        Permission permission = permissionMapper.toEntity(request);
        permission.setModule(findModule(request.moduleId()));

        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    @Transactional
    public PermissionResponse update(Long id, UpdatePermissionRequest request) {
        Permission permission = findById(id);

        permissionMapper.updateEntity(request, permission);
        permission.setModule(findModule(request.moduleId()));

        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Transactional(readOnly = true)
    public PermissionResponse getById(Long id) {
        return permissionMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionResponse getByCode(String code) {
        Permission permission = permissionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + code));

        return permissionMapper.toResponse(permission);
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAllByOrderByIdAsc()
                .stream()
                .map(permissionMapper::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Transactional(readOnly = true)
    public List<PermissionResponse> getByModuleId(Long moduleId) {
        // Validate that the module actually exists.
        findModule(moduleId);

        return permissionRepository.findByModuleId(moduleId)
                .stream()
                .map(permissionMapper::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Transactional(readOnly = true)
    public List<PermissionResponse> getByRoleId(Long roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(()->new ResourceNotFoundException("Role with id = "+ roleId+" not found"))
                .getPermissions()
                .stream()
                .map(permissionMapper::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    @Transactional
    public PermissionResponse deactivate(Long id) {
        Permission permission = findById(id);
        permission.setActive(false);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    @Override
    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
    @Transactional
    public PermissionResponse activate(Long id) {
        Permission permission = findById(id);
        permission.setActive(true);
        return permissionMapper.toResponse(permissionRepository.save(permission));
    }

    private Permission findById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));
    }

    private Module findModule(Long moduleId) {
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));
    }
}
