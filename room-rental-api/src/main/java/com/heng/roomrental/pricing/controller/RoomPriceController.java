package com.heng.roomrental.pricing.controller;

import com.heng.roomrental.common.dto.PageResponse;
import com.heng.roomrental.pricing.dto.*;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import com.heng.roomrental.pricing.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/room-prices")
@RequiredArgsConstructor
public class RoomPriceController {
    private final PricingService pricingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomPriceResponse create(
            @Valid
            @RequestBody
            CreateRoomPriceRequest request
    ) {

        return pricingService.createPrice(
                request
        );
    }


    @GetMapping
    public PageResponse<RoomPriceResponse> search(

            @RequestParam(required = false)
            Long roomId,

            @RequestParam(required = false)
            Long pricingUnitId,

            @RequestParam(required = false)
            RoomPriceStatus status,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate effectiveDate,

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
                    sort = "effectiveFrom",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {

        RoomPriceSearchRequest request =
                new RoomPriceSearchRequest(
                        roomId,
                        pricingUnitId,
                        status,
                        effectiveDate,
                        fromDate,
                        toDate
                );

        return PageResponse.from(
                pricingService.search(
                        request,
                        pageable
                )
        );
    }


    @GetMapping("/{id}")
    public RoomPriceResponse getById(
            @PathVariable Long id
    ) {

        return pricingService.getPrice(id);
    }


    @PutMapping("/{id}")
    public RoomPriceResponse update(
            @PathVariable Long id,

            @Valid
            @RequestBody
            UpdateRoomPriceRequest request
    ) {

        return pricingService.updatePrice(
                id,
                request
        );
    }


    @PostMapping("/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable Long id
    ) {

        pricingService.deactivatePrice(id);
    }
}