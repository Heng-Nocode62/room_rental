package com.heng.roomrental.location;


import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocationMapper {
    private final RoomRepository roomRepository;
    public LocationResponse toLocationResponse(Location location) {
        return new LocationResponse(
                location.getId(),
                location.getName(),
                location.getCode(),
                location.getAddress(),
                location.getPhone(),
                location.getTimeZone(),
                location.getStatus().name(),
                roomRepository.countByLocationId(location.getId())

        );
    }
}
