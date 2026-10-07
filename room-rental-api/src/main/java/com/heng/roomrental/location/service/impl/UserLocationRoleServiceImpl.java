package com.heng.roomrental.location.service.impl;

import com.heng.roomrental.location.dto.UserLocationRoleRequest;
import com.heng.roomrental.location.dto.UserLocationRoleResponse;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.location.service.UserLocationRoleService;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserLocationRoleServiceImpl
        implements UserLocationRoleService {

    private final UserLocationRoleRepository userLocationRoleRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserLocationRoleResponse create(
            UserLocationRoleRequest request
    ) {
        validateRequest(request);

        if (userLocationRoleRepository.existsByUserIdAndLocationIdAndRoleId(
                request.userId(),
                request.locationId(),
                request.roleId()
        )) {
            throw new IllegalArgumentException(
                    "This user already has this role at this location"
            );
        }

        User user = getUser(request.userId());
        Location location = getLocation(request.locationId());
        Role role = getRole(request.roleId());

        UserLocationRole entity = new UserLocationRole();
        entity.setUser(user);
        entity.setLocation(location);
        entity.setRole(role);

        return toResponse(
                userLocationRoleRepository.save(entity)
        );
    }

    @Override
    public UserLocationRoleResponse update(
            Long id,
            UserLocationRoleRequest request
    ) {
        validateRequest(request);

        UserLocationRole entity = getEntity(id);

        boolean changed =
                !entity.getUser().getId().equals(request.userId())
                        || !entity.getLocation().getId().equals(request.locationId())
                        || !entity.getRole().getId().equals(request.roleId());

        if (changed &&
                userLocationRoleRepository
                        .existsByUserIdAndLocationIdAndRoleId(
                                request.userId(),
                                request.locationId(),
                                request.roleId()
                        )) {
            throw new IllegalArgumentException(
                    "This user already has this role at this location"
            );
        }

        entity.setUser(getUser(request.userId()));
        entity.setLocation(getLocation(request.locationId()));
        entity.setRole(getRole(request.roleId()));

        return toResponse(
                userLocationRoleRepository.save(entity)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserLocationRoleResponse getById(Long id) {
        return toResponse(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLocationRoleResponse> getAll() {
        return userLocationRoleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLocationRoleResponse> getByUserId(Long userId) {
        return userLocationRoleRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLocationRoleResponse> getByLocationId(
            Long locationId
    ) {
        return userLocationRoleRepository.findByLocationId(locationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLocationRoleResponse> getByUserAndLocation(
            Long userId,
            Long locationId
    ) {
        return userLocationRoleRepository
                .findByUserIdAndLocationId(userId, locationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermissionAtLocation(
            Long userId,
            Long locationId,
            String permissionCode
    ) {
        return userLocationRoleRepository.hasPermissionAtLocation(
                userId,
                locationId,
                permissionCode
        );
    }

    @Override
    public void delete(Long id) {
        UserLocationRole entity = getEntity(id);
        userLocationRoleRepository.delete(entity);
    }

    private UserLocationRole getEntity(Long id) {
        return userLocationRoleRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User location role not found: " + id
                        )
                );
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found: " + id
                        )
                );
    }

    private Location getLocation(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Location not found: " + id
                        )
                );
    }

    private Role getRole(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Role not found: " + id
                        )
                );
    }

    private void validateRequest(
            UserLocationRoleRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Request cannot be null"
            );
        }

        if (request.userId() == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        if (request.locationId() == null) {
            throw new IllegalArgumentException(
                    "Location ID is required"
            );
        }

        if (request.roleId() == null) {
            throw new IllegalArgumentException(
                    "Role ID is required"
            );
        }
    }

    private UserLocationRoleResponse toResponse(
            UserLocationRole entity
    ) {
        return new UserLocationRoleResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getLocation().getId(),
                entity.getRole().getId()
        );
    }
}