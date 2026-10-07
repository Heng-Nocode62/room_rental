package com.heng.roomrental.room.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.room.dto.*;
import com.heng.roomrental.room.entity.Amenity;
import com.heng.roomrental.room.entity.AmenityStatus;
import com.heng.roomrental.room.repository.AmenityRepository;
import com.heng.roomrental.room.service.AmenityService;
import com.heng.roomrental.room.specification.AmenitySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AmenityServiceImpl implements AmenityService {

    private final AmenityRepository amenityRepository;
    private final LocationRepository locationRepository;

    @Transactional
    @Override
    public AmenityResponse create(CreateAmenityRequest request) {

        locationRepository.findById(request.locationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found: " + request.locationId()
                ));

        if (amenityRepository.existsByLocationIdAndName(
                request.locationId(), request.name())) {
            throw new ConflictException(
                    "Amenity already exists in this location: " + request.name()
            );
        }

        Location location = locationRepository.getReferenceById(request.locationId());

        Amenity amenity = new Amenity();
        amenity.setLocation(location);
        amenity.setName(request.name());
        amenity.setDescription(request.description());
        amenity.setPrice(request.price());
        amenity.setStockQuantity(request.stockQuantity());
        amenity.setStatus(AmenityStatus.ACTIVE);

        return toResponse(amenityRepository.save(amenity));
    }

    @Override

    public AmenityResponse getById(Long id) {
        return toResponse(findEntity(id));
    }


    @Override
    @Transactional(readOnly = true)
    public Page<AmenityResponse> getAll(
            AmenitySearchRequest request,
            Pageable pageable
    ) {

        Specification<Amenity> specification =
                AmenitySpecification.filter(request, null);

        return amenityRepository
                .findAll(specification, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AmenityResponse> getByLocationId(
            Long locationId,
            AmenitySearchRequest request,
            Pageable pageable
    ) {

        // Validate location
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException(
                    "Location not found: " + locationId
            );
        }

        Specification<Amenity> specification =
                AmenitySpecification.filter(request, locationId);

        return amenityRepository
                .findAll(specification, pageable)
                .map(this::toResponse);
    }



    @Transactional
    @Override
    public AmenityResponse update(Long id, UpdateAmenityRequest request) {

        Amenity amenity = findEntity(id);

        if (!amenity.getName().equals(request.name())
                && amenityRepository.existsByLocationIdAndName(
                    amenity.getLocation().getId(), request.name())) {
            throw new ConflictException(
                    "Amenity already exists in this location: " + request.name()
            );
        }

        amenity.setName(request.name());
        amenity.setDescription(request.description());
        amenity.setPrice(request.price());
        amenity.setStockQuantity(request.stockQuantity());

        return toResponse(amenity);
    }

    @Transactional
    @Override
    public void deactivate(Long id) {
        findEntity(id).setStatus(AmenityStatus.INACTIVE);
    }

    private Amenity findEntity(Long id) {
        return amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Amenity not found: " + id
                ));
    }

    private AmenityResponse toResponse(Amenity amenity) {
        return new AmenityResponse(
                amenity.getId(),
                amenity.getLocation().getId(),
                amenity.getName(),
                amenity.getDescription(),
                amenity.getPrice(),
                amenity.getStockQuantity(),
                amenity.getStatus().name()
        );
    }
}
