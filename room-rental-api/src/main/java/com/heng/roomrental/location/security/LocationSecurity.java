package com.heng.roomrental.location.security;

import com.heng.roomrental.audit.service.AuditUserProvider;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.room.service.RoomService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component("locationSecurity")
@RequiredArgsConstructor
public class LocationSecurity {
    private final UserLocationRoleRepository userLocationRoleRepository;
    private final LocationPermissionContext permissionContext;
    private final CurrentUserService currentUserService;

    /** For controllers where locationId is a path variable or @RequestParam. */
    public boolean hasPermission(Long locationId, String permissionCode) {
        User currentUser = currentUserService.getCurrentUserDetails();

        if (isSuperAdmin(currentUser)) {
            return true;
        }
        return permissionContext.hasPermission(currentUser.getId(), locationId, permissionCode);
    }
    /** For controllers where locationId lives inside the @RequestBody DTO. */
    public boolean hasPermission(LocationScoped dto, String permissionCode) {
        if (dto == null) {
            return false;
        }
        return hasPermission(dto.getLocationId(), permissionCode);
    }

    public boolean isSuperAdmin(User user) {
        try {
            Optional<Role> admin = user.getRoles().stream().filter(role -> role.getCode().equals("ADMIN")).findFirst();
            return admin.isPresent();
        } catch (Exception e) {
            return false; // no getGlobalRole() on your principal yet — treat as not-admin
        }
    }

    /** True if the user has ANY role at the given location (useful for read access). */
    public boolean hasAnyAccess(Long locationId) {
        return locationId != null; // placeholder — wire to a real "has any role" query if needed
    }
    public void validateOwner(Long locationId){
        User user = currentUserService.getCurrentUser();
        if(isSuperAdmin(user)){
            return;
        }
        List<UserLocationRole> userLocation = userLocationRoleRepository.findByUserId(user.getId());
        long count = userLocation.stream().filter(
                        userLocationRole -> userLocationRole.getLocation().getId().equals(locationId)
                )
                .count();
        if (count < 1) {
            throw new AccessDeniedException("You don't have permission to access this resource");
        }
    }

}