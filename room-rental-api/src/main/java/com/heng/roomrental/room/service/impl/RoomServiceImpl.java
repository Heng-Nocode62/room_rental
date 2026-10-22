package com.heng.roomrental.room.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.web.SortValidator;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.pricing.dto.CreateRoomPriceRequest;
import com.heng.roomrental.pricing.dto.RoomPriceResponse;
import com.heng.roomrental.pricing.entity.PricingUnit;
import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import com.heng.roomrental.pricing.repository.PricingUnitRepository;
import com.heng.roomrental.pricing.repository.RoomPriceRepository;
import com.heng.roomrental.pricing.service.PricingService;
import com.heng.roomrental.room.dto.*;
import com.heng.roomrental.room.entity.Amenity;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomAmenity;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.entity.RoomType;
import com.heng.roomrental.room.repository.AmenityRepository;
import com.heng.roomrental.room.repository.RoomRepository;
import com.heng.roomrental.room.repository.RoomTypeRepository;
import com.heng.roomrental.room.service.RoomService;
import com.heng.roomrental.room.specification.RoomSpecifications;
import com.heng.roomrental.storage.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final LocationRepository locationRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final SortValidator sortValidator;
    private final PricingService pricingService;
    private final PricingUnitRepository   pricingUnitRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final LocationSecurity locationSecurity;
    private final SupabaseStorageService supabaseStorageService;

    @Override
    @Transactional
    public RoomResponse create(CreateRoomRequest request) {
        Location location = locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found: " + request.locationId()
                ));
        locationSecurity.validateOwner(location.getId());

        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room type not found: " + request.roomTypeId()
                ));
        if(roomType.getLocation().getId() != location.getId()){
            throw new IllegalStateException("Mismatch between location and room type");
        }
        List<RoomAmenityRequest> requests = request.amenities() == null
                ? List.of()
                : request.amenities();

        validateNoDuplicateAmenityIds(requests);


        Map<Long, Amenity> amenities = loadAndLockAmenities(
                request.locationId(), requests
        );

        Room room = new Room();
        room.setLocation(location);
        room.setRoomType(roomType);
        room.setRoomNumber(request.roomNumber());
        room.setName(request.name());
        room.setFloor(request.floor());
        room.setDescription(request.description());
        room.setStatus(RoomStatus.ACTIVE);
        if(request.floor() != null){
            try{
                long floor = Long.parseLong(request.floor());
                if(floor < 0){
                    throw new IllegalArgumentException("Floor must be a positive number");
                }
                if (floor > location.getFloor()){
                    throw new IllegalArgumentException("Invalid floor number");
                }
            }catch (NumberFormatException _){

            }
        }
        for (RoomAmenityRequest amenityRequest : requests) {
            Amenity amenity = amenities.get(amenityRequest.amenityId());

            if (amenity == null) {
                throw new ResourceNotFoundException(
                        "Amenity " + amenityRequest.amenityId()
                                + " does not belong to location " + request.locationId()
                );
            }

            if (amenity.getStatus() != com.heng.roomrental.room.entity.AmenityStatus.ACTIVE) {
                throw new ConflictException(
                        "Amenity is inactive: " + amenity.getId()
                );
            }

            if (amenity.getStockQuantity() < amenityRequest.amount()) {
                throw new ConflictException(
                        "Insufficient stock for amenity: " + amenity.getName()
                );
            }

            amenity.setStockQuantity(
                    amenity.getStockQuantity() - amenityRequest.amount()
            );

            RoomAmenity roomAmenity = new RoomAmenity();
            roomAmenity.setRoom(room);
            roomAmenity.setAmenity(amenity);
            roomAmenity.setAmount(amenityRequest.amount());

            room.getAmenities().add(roomAmenity);
        }
        Room savedRoom = roomRepository.save(room);
        createRoomPrice(savedRoom,request.hourlyPrice(),request.dailyPrice());

        return toResponse(savedRoom);
    }

    private void createRoomPrice(Room room, BigDecimal hourlyPrice,BigDecimal dailyPrice) {
        if (hourlyPrice == null && dailyPrice== null) {
            return;
        }
        OffsetDateTime now = OffsetDateTime.now();
        if (hourlyPrice!= null){
            PricingUnit hourlyUnit = pricingUnitRepository.findByCode("HOURLY").orElseThrow(()-> new ResourceNotFoundException("Hourly price not found"));
            pricingService.createPrice(new CreateRoomPriceRequest(
                    room.getId(),
                    hourlyUnit.getId(),
                    hourlyPrice,
                    "USD",
                    now.toLocalDate(),
                    null
            ));
        }
        if (dailyPrice!= null){
            PricingUnit dailyUnit = pricingUnitRepository.findByCode("DAILY").orElseThrow(()-> new ResourceNotFoundException("Daily price not found"));
            pricingService.createPrice(new CreateRoomPriceRequest(
                    room.getId(),
                    dailyUnit.getId(),
                    dailyPrice,
                    "USD",
                    now.toLocalDate(),
                    null
            ));
        }
    }

    private Map<Long, Amenity> loadAndLockAmenities(
            Long locationId,
            List<RoomAmenityRequest> requests
    ) {
        if (requests.isEmpty()) {
            return Map.of();
        }

        List<Long> ids = requests.stream()
                .map(RoomAmenityRequest::amenityId)
                .distinct()
                .toList();

        return amenityRepository.findAllForUpdate(locationId, ids)
                .stream()
                .collect(Collectors.toMap(Amenity::getId, Function.identity()));
    }

    private void validateNoDuplicateAmenityIds(
            List<RoomAmenityRequest> requests
    ) {
        Set<Long> ids = new HashSet<>();

        for (RoomAmenityRequest request : requests) {
            if (!ids.add(request.amenityId())) {
                throw new ConflictException(
                        "Duplicate amenity in room request: " + request.amenityId()
                );
            }
        }
    }

    @Override
    public RoomResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<RoomResponse> getAll() {
        return roomRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoomResponse update(Long id, UpdateRoomRequest request) {
        Room room = findEntity(id);
        locationSecurity.validateOwner(room.getLocation().getId());

        room.setName(request.name());
        room.setFloor(request.floor());
        room.setDescription(request.description());
        List<RoomPrice> roomPrices = roomPriceRepository.findByRoomId(room.getId());
        OffsetDateTime now = OffsetDateTime.now();
        roomPrices.forEach(roomPrice -> {
            if(roomPrice.getPricingUnit().getCode().equals("HOURLY") && !roomPrice.getPrice().equals(request.hourlyPrice())){
                if(!roomPrice.getEffectiveFrom().equals(now.toLocalDate())){roomPrice.setEffectiveTo(now.toLocalDate());}
                roomPrice.setStatus(RoomPriceStatus.INACTIVE);
                createRoomPrice(
                        room,
                        request.hourlyPrice(),
                        null
                );
            }
            if(roomPrice.getPricingUnit().getCode().equals("DAILY") && !roomPrice.getPrice().equals(request.dailyPrice())){
                if(!roomPrice.getEffectiveFrom().equals(now.toLocalDate())){roomPrice.setEffectiveTo(now.toLocalDate());}
                roomPrice.setStatus(RoomPriceStatus.INACTIVE);
                createRoomPrice(
                        room,
                        null,
                        request.dailyPrice()
                );
            }
        });
        if (roomPrices.isEmpty()) {
            createRoomPrice(room,request.hourlyPrice(),request.dailyPrice());
        }
        return toResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> search(
            RoomSearchRequest request,
            Pageable pageable
    ) {

        if (request.minCapacity() != null
                && request.maxCapacity() != null
                && request.minCapacity() > request.maxCapacity()) {

            throw new IllegalArgumentException(
                    "Minimum capacity cannot exceed maximum capacity."
            );
        }

        if (request.minHourlyPrice() != null
                && request.minHourlyPrice().signum() < 0) {

            throw new IllegalArgumentException(
                    "Minimum hourly price cannot be negative."
            );
        }

        if (request.maxHourlyPrice() != null
                && request.maxHourlyPrice().signum() < 0) {

            throw new IllegalArgumentException(
                    "Maximum hourly price cannot be negative."
            );
        }

        if (request.minHourlyPrice() != null
                && request.maxHourlyPrice() != null
                && request.minHourlyPrice().compareTo(
                request.maxHourlyPrice()
        ) > 0) {

            throw new IllegalArgumentException(
                    "Minimum hourly price cannot exceed maximum hourly price."
            );
        }

        List<Long> selectedAmenityIds =
                new ArrayList<>();

        if (request.amenityId() != null) {
            selectedAmenityIds.add(
                    request.amenityId()
            );
        }

        if (request.amenityIds() != null) {
            selectedAmenityIds.addAll(
                    request.amenityIds()
            );
        }

        selectedAmenityIds =
                selectedAmenityIds.stream()
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        sortValidator.validate(
                pageable,
                Set.of(
                        "roomNumber",
                        "name",
                        "floor",
                        "createdAt",
                        "roomType.capacity"
                )
        );

        List<Specification<Room>> specifications = Stream.of(
                        RoomSpecifications.keyword(request.keyword()),
                        RoomSpecifications.location(request.locationId()),
                        RoomSpecifications.roomType(request.roomTypeId()),
                        RoomSpecifications.status(request.status()),
                        RoomSpecifications.minCapacity(request.minCapacity()),
                        RoomSpecifications.maxCapacity(request.maxCapacity()),
                        RoomSpecifications.floors(request.floors()),
                        RoomSpecifications.amenities(selectedAmenityIds),
                        RoomSpecifications.hourlyPriceRange(
                                request.minHourlyPrice(),
                                request.maxHourlyPrice(),
                                request.effectiveDate()
                        )
                )
                .filter(Objects::nonNull)
                .toList();

        Specification<Room> specification =
                Specification.allOf(specifications);

        return roomRepository
                .findAll(specification, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Room room = findEntity(id);
        locationSecurity.validateOwner(room.getLocation().getId());
        room.setStatus(RoomStatus.INACTIVE);
    }
    @Override
    @Transactional
    public RoomResponse updateImage(
            Long id,
            MultipartFile image
    ) {
        Room room = findEntity(id);

        // Check access to the location containing this room.
        locationSecurity.validateOwner(
                room.getLocation().getId()
        );

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

        // Use a unique path so uploads do not overwrite other rooms' images.
        String path =
                "rooms/"
                        + room.getId()
                        + "/"
                        + UUID.randomUUID()
                        + extension;

        String imageUrl = supabaseStorageService.upload(
                path,
                image
        );

        room.setImageUrl(imageUrl);

        Room savedRoom = roomRepository.save(room);

        return toResponse(savedRoom);
    }

    @Override
    public Room getEntityById(Long id) {
        return findEntity(id);
    }

    private Room findEntity(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found: " + id
                ));
    }

    private void validateImage(MultipartFile image) {

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
                ).contains(contentType.toLowerCase(Locale.ROOT))) {

            throw new IllegalArgumentException(
                    "Only JPEG, PNG, and WebP images are allowed."
            );
        }
    }
    private RoomResponse toResponse(Room room) {

        List<RoomPrice> roomPrices =
                roomPriceRepository.findByRoomId(room.getId());

        return new RoomResponse(
                room.getId(),
                room.getLocation().getId(),
                room.getLocation().getName(),
                room.getRoomType().getId(),
                room.getRoomType().getName(),
                room.getRoomNumber(),
                room.getName(),
                room.getFloor(),
                room.getDescription(),
                room.getImageUrl(),
                room.getRoomType().getCapacity(),
                room.getStatus().name(),
                roomPrices.stream()
                        .filter(r -> r.getStatus().equals(
                                RoomPriceStatus.ACTIVE
                        ))
                        .map(this::toRoomPriceResponse)
                        .toList(),
                room.getAmenities().stream()
                        .map(this::toAmenityResponse)
                        .toList()
        );
    }

    private RoomAmenityResponse toAmenityResponse(RoomAmenity roomAmenity) {
        Amenity amenity = roomAmenity.getAmenity();

        return new RoomAmenityResponse(
                amenity.getId(),
                amenity.getName(),
                amenity.getDescription(),
                amenity.getPrice(),
                roomAmenity.getAmount()
        );
    }
    private RoomPriceResponse toRoomPriceResponse(RoomPrice roomPrice) {
        return new RoomPriceResponse(
                roomPrice.getId(),
                roomPrice.getRoom().getId(),
                roomPrice.getRoom().getRoomNumber(),
                roomPrice.getPricingUnit().getId(),
                roomPrice.getPricingUnit().getCode(),
                roomPrice.getPricingUnit().getName(),
                roomPrice.getPrice(),
                roomPrice.getCurrencyCode(),
                roomPrice.getEffectiveFrom(),
                roomPrice.getEffectiveTo(),
                roomPrice.getStatus().name()
        );
    }
}
