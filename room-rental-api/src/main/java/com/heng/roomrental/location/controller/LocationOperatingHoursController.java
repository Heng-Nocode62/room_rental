package com.heng.roomrental.location.controller;

import com.heng.roomrental.location.dto.OperatingHoursRequest;
import com.heng.roomrental.location.dto.OperatingHoursResponse;
import com.heng.roomrental.location.service.LocationOperatingHoursService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations/{locationId}/operating-hours")
@RequiredArgsConstructor
public class LocationOperatingHoursController {

    private final LocationOperatingHoursService service;

    @GetMapping
    public ResponseEntity<List<OperatingHoursResponse>> getOperatingHours(
            @PathVariable Long locationId
    ) {

        return ResponseEntity.ok(
                service.getByLocation(locationId)
        );
    }

    @PutMapping("/{dayOfWeek}")
    @PreAuthorize("@locationSecurity.hasPermission(#locationId,'LOCATION_UPDATE')")
    public ResponseEntity<OperatingHoursResponse> updateOperatingHours(
            @PathVariable Long locationId,
            @PathVariable Short dayOfWeek,
            @Valid @RequestBody OperatingHoursRequest request
    ) {

        return ResponseEntity.ok(
                service.upsert(
                        locationId,
                        dayOfWeek,
                        request
                )
        );
    }

    @DeleteMapping("/{dayOfWeek}")
    @PreAuthorize("@locationSecurity.hasPermission(#locationId,'LOCATION_UPDATE')")
    public ResponseEntity<Void> deleteOperatingHours(
            @PathVariable Long locationId,
            @PathVariable Short dayOfWeek
    ) {

        service.delete(
                locationId,
                dayOfWeek
        );

        return ResponseEntity.noContent().build();
    }
}