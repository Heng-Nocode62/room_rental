package com.heng.roomrental.room.controller;

import com.heng.roomrental.room.dto.CreateRoomTypeRequest;
import com.heng.roomrental.room.dto.RoomTypeResponse;
import com.heng.roomrental.room.dto.UpdateRoomTypeRequest;
import com.heng.roomrental.room.service.RoomTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROOM_TYPE_CREATE')")
    public RoomTypeResponse create(
            @Valid
            @RequestBody
            CreateRoomTypeRequest request
    ) {

        return roomTypeService.create(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOM_TYPE_VIEW')")
    public RoomTypeResponse getById(
            @PathVariable Long id
    ) {

        return roomTypeService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROOM_TYPE_VIEW')")
    public List<RoomTypeResponse> getAll() {

        return roomTypeService.getAll();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOM_TYPE_UPDATE')")
    public RoomTypeResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateRoomTypeRequest request
    ) {

        return roomTypeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROOM_TYPE_DEACTIVATE')")
    public void deactivate(
            @PathVariable Long id
    ) {
        roomTypeService.deactivate(id);
    }
}