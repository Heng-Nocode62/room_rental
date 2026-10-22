package com.heng.roomrental.room.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.room.dto.CreateRoomTypeRequest;
import com.heng.roomrental.room.dto.RoomTypeResponse;
import com.heng.roomrental.room.dto.UpdateRoomTypeRequest;
import com.heng.roomrental.room.entity.RoomType;
import com.heng.roomrental.room.entity.RoomTypeStatus;
import com.heng.roomrental.room.repository.RoomTypeRepository;
import com.heng.roomrental.room.service.RoomTypeService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.storage.SupabaseStorageService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final LocationRepository locationRepository;
    private final LocationSecurity locationSecurity;
    @Override
    @Transactional
    public RoomTypeResponse create(
            CreateRoomTypeRequest request
    ) {
        log.info("Request reach service {}",request.toString());
        Location location = locationRepository.findById(request.locationId()).orElseThrow(()-> new ResourceNotFoundException("Location not found"));
        log.info("check security");
        locationSecurity.validateOwner(location.getId());

        if (roomTypeRepository.existsByCodeAndLocation_Id(request.code(),request.locationId())) {
            throw new IllegalArgumentException(
                    "Room type code already exists: "
                            + request.code()
            );
        }

        RoomType roomType = new RoomType();
        roomType.setName(request.name());
        roomType.setCode(request.code());
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());
        roomType.setStatus(RoomTypeStatus.ACTIVE);
        roomType.setLocation(location);

        return toResponse(
                roomTypeRepository.save(roomType)
        );
    }

    @Override
    public RoomTypeResponse getById(Long id) {

        return toResponse(findEntity(id));
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_TYPE_VIEW')")
    public List<RoomTypeResponse> getAll() {

        return roomTypeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoomTypeResponse update(
            Long id,
            UpdateRoomTypeRequest request
    ) {
        RoomType roomType = findEntity(id);




        roomType.setName(request.name());
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());

        return toResponse(roomType);
    }
    @Override
    @Transactional
    public RoomTypeResponse updateImage(
            Long id,
            MultipartFile image
    ) {
        RoomType roomType = findEntity(id);

        locationSecurity.validateOwner(roomType.getLocation().getId());
        validateImage(image);

        String oldImageUrl = roomType.getImageUrl();

        String extension = switch (image.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Unsupported image type."
            );
        };

        String path =
                "room-types/"
                        + roomType.getId()
                        + "/"
                        + java.util.UUID.randomUUID()
                        + extension;

        String newImageUrl =
                supabaseStorageService.upload(
                        path,
                        image
                );

        roomType.setImageUrl(newImageUrl);

        RoomType saved =
                roomTypeRepository.save(roomType);
        return toResponse(saved);
    }

    @Override
    @Transactional

    public void deactivate(Long id) {
        RoomType roomType = findEntity(id);
        locationSecurity.validateOwner(roomType.getLocation().getId());
        roomType.setStatus(RoomTypeStatus.INACTIVE);
    }

    @Override
    public List<RoomTypeResponse> getByLocationId(Long locationId) {
        locationSecurity.validateOwner(locationId);
       return roomTypeRepository.findAllByLocation_Id(locationId)
                .stream()
                .map(this::toResponse)
                .toList();

    }

    private RoomType findEntity(Long id) {

        return roomTypeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room type not found: " + id
                        )
                );
    }

    private RoomTypeResponse toResponse(RoomType roomType) {

        return new RoomTypeResponse(
                roomType.getId(),
                roomType.getName(),
                roomType.getCode(),
                roomType.getDescription(),
                roomType.getCapacity(),
                roomType.getImageUrl(),
                roomType.getStatus().name(),
                roomType.getLocation().getId()
        );
    }

    private void validateImage(
            MultipartFile image
    ) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image is required."
            );
        }

        if (image.getSize() > 5 * 1024 * 1024L) {
            throw new IllegalArgumentException(
                    "Image must not exceed 5 MB."
            );
        }

        String contentType = image.getContentType();

        if (contentType == null ||
                !Set.of(
                        "image/jpeg",
                        "image/png",
                        "image/webp"
                ).contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG, and WebP images are allowed."
            );
        }
    }
}