package com.heng.roomrental.location.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.LocationMapper;
import com.heng.roomrental.location.dto.CreateLocationRequest;
import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.dto.UpdateLocationRequest;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.LocationStatus;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.location.service.LocationService;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.repository.RoomRepository;
import com.heng.roomrental.storage.SupabaseStorageService;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024L;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final LocationRepository locationRepository;
    private final RoomRepository roomRepository;
    private final LocationMapper locationMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserLocationRoleRepository userLocationRoleRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final LocationSecurity locationSecurity;

    @Override
    @Transactional
    public LocationResponse create(CreateLocationRequest request) {

        if (locationRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException(
                    "Location code already exists: " + request.code()
            );
        }

        User owner = userRepository.findById(request.ownerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Owner user not found: " + request.ownerId()
                        )
                );

        boolean hasOwnerRole = owner.getRoles()
                .stream()
                .anyMatch(role ->
                        "OWNER".equalsIgnoreCase(role.getCode())
                );

        if (!hasOwnerRole) {
            throw new IllegalArgumentException(
                    "Selected user does not have the OWNER role"
            );
        }

        Role ownerRole = roleRepository.findByCode("OWNER")
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "OWNER role not found"
                        )
                );

        Location location = new Location();

        location.setName(request.name().trim());
        location.setCode(request.code().trim());
        location.setAddress(normalizeOptional(request.address()));
        location.setPhone(normalizeOptional(request.phone()));
        location.setTimeZone(request.timeZone().trim());
        location.setFloor(request.floor());
        location.setLocationBakongAccountId(
                normalizeOptional(request.locationBakongAccountId())
        );
        location.setTelegramContact(
                normalizeOptional(request.telegramContact())
        );
        location.setStatus(LocationStatus.ACTIVE);

        Location savedLocation = locationRepository.save(location);

        UserLocationRole ownerAssignment = new UserLocationRole();
        ownerAssignment.setUser(owner);
        ownerAssignment.setLocation(savedLocation);
        ownerAssignment.setRole(ownerRole);

        userLocationRoleRepository.save(ownerAssignment);

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
                .filter(location ->
                        location.getStatus() == LocationStatus.ACTIVE
                )
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
        location.setName(request.name().trim());
        location.setAddress(normalizeOptional(request.address()));
        location.setPhone(normalizeOptional(request.phone()));
        location.setTimeZone(request.timeZone().trim());
        location.setFloor(request.floor());
        location.setLocationBakongAccountId(
                normalizeOptional(request.locationBakongAccountId())
        );
        location.setTelegramContact(
                normalizeOptional(request.telegramContact())
        );

        return locationMapper.toLocationResponse(
                locationRepository.save(location)
        );
    }

    @Override
    @Transactional
    public LocationResponse updateImage(
            Long id,
            MultipartFile image
    ) {

        Location location = findEntity(id);

        locationSecurity.validateOwner(location.getId());

        validateImage(image);

        String contentType = image.getContentType()
                .toLowerCase(Locale.ROOT);

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Only JPEG, PNG, and WebP images are allowed."
            );
        };

        String path =
                "locations/"
                        + location.getId()
                        + "/"
                        + UUID.randomUUID()
                        + extension;

        String imageUrl = supabaseStorageService.upload(
                path,
                image
        );

        location.setImageUrl(imageUrl);

        Location savedLocation = locationRepository.save(location);

        return locationMapper.toLocationResponse(savedLocation);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {

        Location location = findEntity(id);

        location.setStatus(LocationStatus.INACTIVE);

        List<Room> rooms =
                roomRepository.findByLocationId(location.getId());

        rooms.forEach(room ->
                room.setStatus(RoomStatus.INACTIVE)
        );
    }

    private Location findEntity(Long id) {

        return locationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found: " + id
                        )
                );
    }

    private void validateImage(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image is required."
            );
        }

        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException(
                    "Image must not exceed 5 MB."
            );
        }

        String contentType = image.getContentType();

        if (contentType == null ||
                !ALLOWED_IMAGE_TYPES.contains(
                        contentType.toLowerCase(Locale.ROOT)
                )) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG, and WebP images are allowed."
            );
        }
    }

    private String normalizeOptional(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}