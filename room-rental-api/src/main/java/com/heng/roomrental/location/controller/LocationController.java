package com.heng.roomrental.location.controller;

import com.heng.roomrental.location.dto.CreateLocationRequest;
import com.heng.roomrental.location.dto.LocationResponse;
import com.heng.roomrental.location.dto.UpdateLocationRequest;
import com.heng.roomrental.location.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    @PreAuthorize("hasAuthority('LOCATION_CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public LocationResponse create(
            @Valid @RequestBody CreateLocationRequest request
    ) {
        return locationService.create(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('LOCATION_VIEW')")
    public LocationResponse getById(
            @PathVariable Long id
    ) {
        return locationService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LOCATION_VIEW')")
    public List<LocationResponse> getAll() {
        return locationService.getAll();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('LOCATION_UPDATE')")
    public LocationResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        return locationService.update(id, request);
    }

    @PutMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('LOCATION_UPDATE')")
    public LocationResponse updateImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return locationService.updateImage(id, image);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('LOCATION_DEACTIVATE')")
    public void deactivate(
            @PathVariable Long id
    ) {
        locationService.deactivate(id);
    }
}