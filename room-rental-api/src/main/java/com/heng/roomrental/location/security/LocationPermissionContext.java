package com.heng.roomrental.location.security;

import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.location.repository.UserLocationRoleRepository.LocationPermissionRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Loads the current user's locationId -> permission codes map once per HTTP
 * request (request-scoped bean), instead of hitting the DB on every
 * hasPermission() call within the same request.
 *
 * If you'd rather cache this at login and store it in the JWT/session instead
 * of re-querying per request, replace loadIfNeeded() with a read from your
 * UserDetails/JWT claims and drop the @RequestScope.
 */
@Component
@RequiredArgsConstructor
@RequestScope
public class LocationPermissionContext {

    private final UserLocationRoleRepository repository;

    private Map<Long, Set<String>> locationPermissions;
    private Long loadedForUserId;

    public boolean hasPermission(Long userId, Long locationId, String permissionCode) {
        if (locationId == null) {
            return false;
        }
        loadIfNeeded(userId);
        Set<String> perms = locationPermissions.get(locationId);
        return perms != null && perms.contains(permissionCode);
    }

    private void loadIfNeeded(Long userId) {
        if (locationPermissions != null && userId.equals(loadedForUserId)) {
            return;
        }
        Map<Long, Set<String>> map = new HashMap<>();
        for (LocationPermissionRow row : repository.findAllPermissionsForUser(userId)) {
            map.computeIfAbsent(row.getLocationId(), k -> new HashSet<>())
               .add(row.getPermissionCode());
        }
        this.locationPermissions = map;
        this.loadedForUserId = userId;
    }
}