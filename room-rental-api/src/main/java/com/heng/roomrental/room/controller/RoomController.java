package com.heng.roomrental.room.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.room.dto.CreateRoomRequest;
import com.heng.roomrental.room.dto.RoomResponse;
import com.heng.roomrental.room.dto.RoomSearchRequest;
import com.heng.roomrental.room.dto.UpdateRoomRequest;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.service.RoomService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@locationSecurity.hasPermission(#request.locationId, 'ROOM_CREATE')")
    public RoomResponse create(
            @Valid
            @RequestBody
            CreateRoomRequest request
    ) {

        return roomService.create(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOM_VIEW')")
    public RoomResponse getById(
            @PathVariable Long id
    ) {

        return roomService.getById(id);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROOM_VIEW')")
    public PageResponse<RoomResponse> search(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Long locationId,

            @RequestParam(required = false)
            Long roomTypeId,

            @RequestParam(required = false)
            RoomStatus status,

            @RequestParam(required = false)
            Integer minCapacity,

            @RequestParam(required = false)
            Integer maxCapacity,

            @RequestParam(required = false)
            Long amenityId,

            @PageableDefault(
                    size = 20,
                    sort = "roomNumber",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        RoomSearchRequest request =
                new RoomSearchRequest(
                        keyword,
                        locationId,
                        roomTypeId,
                        status,
                        minCapacity,
                        maxCapacity,
                        amenityId
                );

        return PageResponse.from(
                roomService.search(
                        request,
                        pageable
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("@locationSecurity.hasPermission(#id, 'ROOM_UPDATE')")
    public RoomResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateRoomRequest request
    ) {

        return roomService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@locationSecurity.hasPermission(#id, 'ROOM_DEACTIVATE')")
    public void deactivate(
            @PathVariable Long id
    ) {

        roomService.deactivate(id);
    }
}