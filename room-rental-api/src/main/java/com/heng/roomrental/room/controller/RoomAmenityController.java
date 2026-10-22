package com.heng.roomrental.room.controller;

import com.heng.roomrental.room.dto.RoomAmenityRequest;
import com.heng.roomrental.room.dto.RoomAmenityResponse;
import com.heng.roomrental.room.service.RoomAmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/amenities")
@RequiredArgsConstructor
public class RoomAmenityController {

    private final RoomAmenityService roomAmenityService;

    @GetMapping
    @PreAuthorize("hasAuthority('AMENITY_VIEW')")
    public List<RoomAmenityResponse> getAmenities(@PathVariable Long roomId) {
        return roomAmenityService.getAmenities(roomId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROOM_AMENITY_MANAGE')")
    public void addAmenity(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomAmenityRequest request
    ) {
        roomAmenityService.addAmenity(roomId, request);
    }

    @DeleteMapping("/{amenityId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROOM_AMENITY_MANAGE')")
    public void removeAmenity(
            @PathVariable Long roomId,
            @PathVariable Long amenityId,
            @RequestParam(required = false) Integer amount
    ) {
        roomAmenityService.removeAmenity(roomId, amenityId, amount);
    }
}
