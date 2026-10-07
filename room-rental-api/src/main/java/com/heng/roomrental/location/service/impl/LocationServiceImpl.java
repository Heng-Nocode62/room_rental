package com.heng.roomrental.location.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.LocationMapper;
import com.heng.roomrental.location.dto.CreateLocationRequest;
import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.dto.UpdateLocationRequest;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.LocationStatus;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.location.service.LocationService;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final RoomRepository roomRepository;
    private final LocationMapper locationMapper;

    @Override
    @Transactional
    public LocationResponse create(CreateLocationRequest request) {

        if (locationRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException(
                    "Location code already exists: " + request.code()
            );
        }

        Location location = new Location();

        location.setName(request.name());
        location.setCode(request.code());
        location.setAddress(request.address());
        location.setPhone(request.phone());
        location.setTimeZone(request.timeZone());
        location.setStatus(LocationStatus.ACTIVE);
        Location savedLocation = locationRepository.save(location);

        return locationMapper.toLocationResponse(savedLocation);
    }

    @Override
    public LocationResponse getById(Long id) {

        return locationMapper.toLocationResponse(findEntity(id));
    }

    @Override
    public List<LocationResponse> getAll() {

        return locationRepository.findAll()
                .stream()
                .filter(location -> location.getStatus() == LocationStatus.ACTIVE)
                .map(locationMapper::toLocationResponse)
                .toList();
    }

    @Override
    @Transactional
    public LocationResponse update(
            Long id,
            UpdateLocationRequest request
    ) {

        Location location = findEntity(id);

        location.setName(request.name());
        location.setAddress(request.address());
        location.setPhone(request.phone());
        location.setTimeZone(request.timeZone());

        return locationMapper.toLocationResponse(location);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {

        Location location = findEntity(id);
        location.setStatus(LocationStatus.INACTIVE);
        List<Room> rooms = roomRepository.findByLocationId(location.getId());
        rooms.forEach(room -> {
            room.setStatus(RoomStatus.INACTIVE);
        });
    }

    private Location findEntity(Long id) {

        return locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found: " + id
                        )
                );
    }

}