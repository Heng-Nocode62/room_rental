package com.heng.roomrental.security.authentication.service;


import com.heng.roomrental.security.authentication.dto.NavigationResponse;
import com.heng.roomrental.security.authentication.dto.NavigationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class NavigationServiceImpl implements NavigationService {

    @Override
    public List<NavigationResponse> getNavigation(
            Set<String> permissions
    ) {

        List<NavigationResponse> items = new ArrayList<>();

        // ==========================================
        // APPLICATION
        // ==========================================

        items.add(item(
                "navigation.dashboard",
                "/dashboard",
                "LayoutDashboard",
                "application",
                null
        ));

        items.add(
                parent(
                        "navigation.availability",
                        "/availability",
                        "CalendarDays",
                        "application",
                        "AVAILABILITY_VIEW",
                        List.of(
                                item(
                                        "navigation.hourlyAvailability",
                                        "/availability/hourly",
                                        "Clock",
                                        "application",
                                        "AVAILABILITY_VIEW"
                                ),
                                item(
                                        "navigation.dailyAvailability",
                                        "/availability/daily",
                                        "CalendarDays",
                                        "application",
                                        "AVAILABILITY_VIEW"
                                )
                        )
                )
        );

        items.add(item(
                "navigation.reservations",
                "/reservations",
                "ClipboardList",
                "application",
                "RESERVATION_VIEW"
        ));

        // ==========================================
        // SETUP
        // ==========================================

        items.add(item(
                "navigation.locations",
                "/locations",
                "MapPin",
                "setup",
                "LOCATION_VIEW"
        ));

        items.add(item(
                "navigation.roomTypes",
                "/room-types",
                "Sparkles",
                "setup",
                "ROOM_TYPE_VIEW"
        ));


        items.add(item(
                "navigation.rooms",
                "/rooms",
                "DoorOpen",
                "setup",
                "ROOM_VIEW"
        ));

        items.add(item(
                "navigation.amenities",
                "/amenities",
                "Tag",
                "setup",
                "AMENITY_VIEW"
        ));
        items.add(item(
                "navigation.pricing",
                "/room-prices",
                "CircleDollarSign",
                "setup",
                "ROOM_PRICE_VIEW"
        ));
        items.add(item(
                "navigation.roomBlocks",
                "/room-blocks",
                "Ban",
                "setup",
                "ROOM_BLOCK_VIEW"
        ));

        // ==========================================
        // SETTINGS
        // ==========================================

        items.add(item(
                "navigation.users",
                "/users",
                "Users",
                "settings",
                "USER_VIEW"
        ));
        items.add(item(
                "navigation.permissions",
                "/permissions",
                "ShieldCheck",
                "settings",
                "PERMISSION_VIEW"
        ));

        items.add(item(
                "navigation.roles",
                "/roles",
                "ShieldCheck",
                "settings",
                "ROLE_VIEW"
        ));
        items.add(item(
                "navigation.userLocationRoles",
                "/user-location-roles",
                "ShieldCheck",
                "settings",
                "ROLE_VIEW"
        ));


        items.add(item(
                "navigation.auditLogs",
                "/audit-logs",
                "ScrollText",
                "settings",
                "AUDIT_VIEW"
        ));


        items.add(item(
                "navigation.languages",
                "/languages",
                "Languages",
                "settings",
                "LANGUAGE_VIEW"
        ));

        items.add(item(
                "navigation.settings",
                "/settings",
                "Settings2",
                "settings",
                "SETTINGS_VIEW"
        ));

        // ==========================================
        // FILTER BY PERMISSIONS
        // ==========================================

        return items.stream()
                .map(item -> filterItem(item, permissions))
                .filter(item -> item != null)
                .toList();
    }

    private NavigationResponse item(
            String key,
            String path,
            String icon,
            String group,
            String permission
    ) {

        return NavigationResponse.builder()
                .key(key)
                .path(path)
                .icon(icon)
                .group(group)
                .permission(permission)
                .children(null)
                .build();
    }

    private NavigationResponse parent(
            String key,
            String path,
            String icon,
            String group,
            String permission,
            List<NavigationResponse> children
    ) {

        return NavigationResponse.builder()
                .key(key)
                .path(path)
                .icon(icon)
                .group(group)
                .permission(permission)
                .children(children)
                .build();
    }

    private NavigationResponse filterItem(
            NavigationResponse item,
            Set<String> permissions
    ) {

        List<NavigationResponse> filteredChildren = null;

        if (item.getChildren() != null) {

            filteredChildren = item.getChildren()
                    .stream()
                    .map(child -> filterItem(child, permissions))
                    .filter(child -> child != null)
                    .toList();
        }

        boolean hasPermission =
                item.getPermission() == null
                || permissions.contains(item.getPermission());

        boolean hasChildren =
                filteredChildren != null
                && !filteredChildren.isEmpty();

        if (!hasPermission && !hasChildren) {
            return null;
        }

        return NavigationResponse.builder()
                .key(item.getKey())
                .path(item.getPath())
                .icon(item.getIcon())
                .group(item.getGroup())
                .permission(item.getPermission())
                .children(filteredChildren)
                .build();
    }
}