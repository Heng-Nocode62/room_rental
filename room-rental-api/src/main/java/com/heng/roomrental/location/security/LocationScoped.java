package com.heng.roomrental.location.security;

/**
 * Implement this on any request DTO that carries a locationId, so
 * @PreAuthorize can call @locationSecurity.hasPermission(#dto, 'CODE')
 * without caring whether the DTO field is called locationId, targetLocationId, etc.
 */
public interface LocationScoped {
    Long getLocationId();
}