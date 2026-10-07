package com.heng.roomrental.role.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.permission.dto.PermissionResponse;
import com.heng.roomrental.permission.entity.Permission;
import com.heng.roomrental.permission.mapper.PermissionMapper;
import com.heng.roomrental.permission.repository.PermissionRepository;
import com.heng.roomrental.role.dto.CreateRoleRequest;
import com.heng.roomrental.role.dto.RoleResponse;
import com.heng.roomrental.role.dto.UpdateRoleRequest;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.role.service.RoleService;
import com.heng.roomrental.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl
        implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionMapper permissionMapper;
    private final PermissionRepository permissionRepository;



    @Override
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    @Transactional
    public RoleResponse create(
            CreateRoleRequest request
    ) {

        String code =
                normalizeCode(
                        request.code()
                );
        if (roleRepository.existsByCode(code)) {

            throw new ConflictException(
                    "ROLE_CODE_ALREADY_EXISTS",
                    "Role code already exists: "
                            + code
            );
        }


        Role role =
                new Role();

        role.setCode(code);

        role.setName(
                request.name().trim()
        );

        role.setDescription(
                normalizeNullable(
                        request.description()
                )
        );
        if (request.permissionIds() != null
                && !request.permissionIds().isEmpty()) {

            List<Permission> permissions =
                    permissionRepository.findAllById(
                            request.permissionIds()
                    );


            if (permissions.size()
                    != request.permissionIds().size()) {

                Set<Long> foundIds =
                        permissions
                                .stream()
                                .map(Permission::getId)
                                .collect(
                                        java.util.stream.Collectors.toSet()
                                );


                Set<Long> missingIds =
                        new HashSet<>(
                                request.permissionIds()
                        );

                missingIds.removeAll(
                        foundIds
                );


                throw new ResourceNotFoundException(
                        "Permissions not found: "
                                + missingIds
                );
            }


            role.getPermissions()
                    .addAll(permissions);
        }


        Role saved =
                roleRepository.save(role);

        return toResponse(saved);
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Transactional(readOnly = true)
    public RoleResponse getById(
            Long id
    ) {

        Role role =
                getEntityById(id);

        return toResponse(role);
    }



    @Override
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {

        return roleRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    @Transactional
    public RoleResponse update(
            Long id,
            UpdateRoleRequest request
    ) {

        Role role =
                getEntityById(id);


        role.setName(
                request.name().trim()
        );

        role.setDescription(
                normalizeNullable(
                        request.description()
                )
        );


        Role saved =
                roleRepository.save(role);

        return toResponse(saved);
    }



    @Override
    @PreAuthorize("hasAuthority('ROLE_DEACTIVATE')")
    @Transactional
    public RoleResponse deactivate(
            Long id
    ) {

        Role role =
                getEntityById(id);


        if (!role.isActive()) {

            throw new InvalidOperationException(
                    "ROLE_ALREADY_INACTIVE",
                    "Role "
                            + role.getCode()
                            + " is already inactive."
            );
        }


        if (isSystemRole(role)) {

            throw new InvalidOperationException(
                    "SYSTEM_ROLE_CANNOT_BE_DEACTIVATED",
                    "System role "
                            + role.getCode()
                            + " cannot be deactivated."
            );
        }


        role.setActive(false);


        Role saved =
                roleRepository.save(role);

        return toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_ACTIVATE')")
    @Transactional
    public RoleResponse activate(
            Long id
    ) {

        Role role =
                getEntityById(id);


        if (role.isActive()) {

            throw new InvalidOperationException(
                    "ROLE_ALREADY_ACTIVE",
                    "Role "
                            + role.getCode()
                            + " is already active."
            );
        }


        role.setActive(true);


        Role saved =
                roleRepository.save(role);

        return toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    @Transactional
    public RoleResponse assignPermissions(
            Long roleId,
            Set<Long> permissionIds
    ) {

        Role role =
                getEntityById(roleId);



        List<Permission> permissions =
                permissionRepository
                        .findAllById(
                                permissionIds
                        );



        if (permissions.size()
                != permissionIds.size()) {

            Set<Long> foundIds =
                    permissions
                            .stream()
                            .map(Permission::getId)
                            .collect(
                                    java.util.stream.Collectors
                                            .toSet()
                            );

            Set<Long> missingIds =
                    new HashSet<>(
                            permissionIds
                    );

            missingIds.removeAll(
                    foundIds
            );

            throw new ResourceNotFoundException(
                    "Permissions not found: "
                            + missingIds
            );
        }



        role.getPermissions()
                .clear();

        role.getPermissions()
                .addAll(permissions);


        Role saved =
                roleRepository.save(role);

        return toResponse(saved);
    }



    private Role getEntityById(
            Long id
    ) {

        return roleRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found: "
                                        + id
                        )
                );
    }



    private boolean isSystemRole(
            Role role
    ) {

        return switch (role.getCode()) {

            case "ADMIN",
                 "OWNER",
                 "MANAGER",
                 "USER",
                 "STAFF" -> true;

            default -> false;
        };
    }



    private String normalizeCode(
            String code
    ) {

        if (code == null
                || code.isBlank()) {

            throw new IllegalArgumentException(
                    "Role code is required."
            );
        }

        return code
                .trim()
                .toUpperCase();
    }



    private String normalizeNullable(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }



    private RoleResponse toResponse(
            Role role
    ) {

        List<PermissionResponse> permissions =
                role.getPermissions()
                        .stream()
                        .map(permissionMapper::toResponse)
                        .toList();


        return new RoleResponse(

                role.getId(),

                role.getCode(),

                role.getName(),

                role.getDescription(),
                role.isActive(),
                permissions
        );
    }
}