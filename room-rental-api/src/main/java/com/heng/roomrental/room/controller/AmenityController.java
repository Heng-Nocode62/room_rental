package com.heng.roomrental.room.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.room.dto.AmenityResponse;
import com.heng.roomrental.room.dto.AmenitySearchRequest;
import com.heng.roomrental.room.dto.CreateAmenityRequest;
import com.heng.roomrental.room.dto.UpdateAmenityRequest;
import com.heng.roomrental.room.service.AmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@locationSecurity.hasPermission(#request.locationId,'AMENITY_CREATE')")
    public AmenityResponse create(@Valid @RequestBody CreateAmenityRequest request) {
        return amenityService.create(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AMENITY_VIEW')")
    public AmenityResponse getById(@PathVariable Long id) {
        return amenityService.getById(id);
    }

    @GetMapping
    public PageResponse<AmenityResponse> getAll(
            @ModelAttribute AmenitySearchRequest request,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return PageResponse.from(
                amenityService.getAll(request, pageable)
        );
    }

    @GetMapping("/location/{locationId}")
    @PreAuthorize("hasAuthority('AMENITY_VIEW')")
    public PageResponse<AmenityResponse> getByLocationId(
            @PathVariable Long locationId,
            @ModelAttribute AmenitySearchRequest request,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return PageResponse.from(
                amenityService.getByLocationId(
                        locationId,
                        request,
                        pageable
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("@locationSecurity.hasPermission(#id,'AMENITY_UPDATE')")
    public AmenityResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAmenityRequest request
    ) {
        return amenityService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@locationSecurity.hasPermission(#request.locationId,'AMENITY_DEACTIVATE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable Long id) {
        amenityService.deactivate(id);
    }
}
