package com.heng.roomrental.room.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.room.dto.CreateRoomRequest;
import com.heng.roomrental.room.dto.RoomResponse;
import com.heng.roomrental.room.dto.RoomSearchRequest;
import com.heng.roomrental.room.dto.UpdateRoomRequest;
import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROOM_CREATE')")
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

            @RequestParam(required = false)
            List<Long> amenityIds,

            @RequestParam(required = false)
            List<String> floors,

            @RequestParam(required = false)
            BigDecimal minHourlyPrice,

            @RequestParam(required = false)
            BigDecimal maxHourlyPrice,

            @RequestParam(required = false)
            LocalDate effectiveDate,

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
                        amenityId,
                        amenityIds,
                        floors,
                        minHourlyPrice,
                        maxHourlyPrice,
                        effectiveDate
                );

        return PageResponse.from(
                roomService.search(
                        request,
                        pageable
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOM_UPDATE')")
    public RoomResponse update(
            @PathVariable Long id,
            @Valid
            @RequestBody
            UpdateRoomRequest request
    ) {
        return roomService.update(id, request);
    }

    @PutMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ROOM_UPDATE')")
    public RoomResponse updateImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image
    ) {
        return roomService.updateImage(id, image);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROOM_DEACTIVATE')")
    public void deactivate(
            @PathVariable Long id
    ) {
        roomService.deactivate(id);
    }
}