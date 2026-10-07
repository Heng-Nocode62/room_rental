package com.heng.roomrental.reservation.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.reservation.dto.CreateRoomBlockRequest;
import com.heng.roomrental.reservation.dto.RoomBlockResponse;
import com.heng.roomrental.reservation.dto.RoomBlockSearchRequest;
import com.heng.roomrental.reservation.entity.RoomBlockStatus;
import com.heng.roomrental.reservation.entity.RoomBlockType;
import com.heng.roomrental.reservation.service.RoomBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/room-blocks")
@RequiredArgsConstructor
public class RoomBlockController {

    private final RoomBlockService roomBlockService;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomBlockResponse create(
            @Valid
            @RequestBody
            CreateRoomBlockRequest request
    ) {

        return roomBlockService.create(request);
    }


    @GetMapping("/{id}")
    public RoomBlockResponse getById(
            @PathVariable Long id
    ) {

        return roomBlockService.getById(id);
    }



    @GetMapping("/room/{roomId}")
    public List<RoomBlockResponse> getByRoom(
            @PathVariable Long roomId
    ) {

        return roomBlockService.getByRoom(roomId);
    }
    @GetMapping
    public PageResponse<RoomBlockResponse> search(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            Long roomId,

            @RequestParam(required = false)
            Long locationId,

            @RequestParam(required = false)
            RoomBlockType blockType,

            @RequestParam(required = false)
            RoomBlockStatus status,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate toDate,

            @PageableDefault(
                    size = 20,
                    sort = "startAt",
                    direction = Sort.Direction.ASC
            )
            Pageable pageable
    ) {

        RoomBlockSearchRequest request =
                new RoomBlockSearchRequest(
                        keyword,
                        roomId,
                        locationId,
                        blockType,
                        status,
                        date,
                        fromDate,
                        toDate
                );

        return PageResponse.from(
                roomBlockService.search(
                        request,
                        pageable
                )
        );
    }



    @PostMapping("/{id}/cancel")
    public RoomBlockResponse cancel(
            @PathVariable Long id
    ) {

        return roomBlockService.cancel(id);
    }


    @PostMapping("/{id}/complete")
    public RoomBlockResponse complete(
            @PathVariable Long id
    ) {

        return roomBlockService.complete(id);
    }
}