package com.heng.roomrental.location;

import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LocationMapper {

    private final RoomRepository roomRepository;
    private final UserLocationRoleRepository userLocationRoleRepository;

    public LocationResponse toLocationResponse(Location location) {

        List<UserLocationRole> userLocationRoles =
                userLocationRoleRepository.findByLocationId(location.getId());

        Optional<UserLocationRole> owner = userLocationRoles.stream()
                .filter(userLocationRole ->
                        "OWNER".equalsIgnoreCase(
                                userLocationRole.getRole().getCode()
                        )
                )
                .findFirst();

        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getCode(),
                location.getAddress(),
                location.getPhone(),
                location.getTimeZone(),
                location.getFloor(),
                owner.map(userLocationRole ->
                        userLocationRole.getUser().getId()
                ).orElse(null),
                location.getStatus().name(),
                roomRepository.countByLocationId(location.getId()),
                location.getImageUrl(),
                location.getLocationBakongAccountId(),
                location.getTelegramContact()
        );
    }
}