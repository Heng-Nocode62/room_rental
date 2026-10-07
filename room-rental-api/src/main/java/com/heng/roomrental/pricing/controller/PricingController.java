package com.heng.roomrental.pricing.controller;

import com.heng.roomrental.pricing.dto.PriceCalculationRequest;
import com.heng.roomrental.pricing.dto.PriceCalculationResult;
import com.heng.roomrental.pricing.service.PricingCalculationService;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final PricingCalculationService pricingCalculationService;
    private final RoomService roomService;

    @PostMapping("/calculate")
    public PriceCalculationResult calculate(
            @Valid @RequestBody PriceCalculationRequest request
    ) {

        Room room = roomService.getEntityById(request.roomId());

        return pricingCalculationService.calculate(
                room,
                request.pricingUnitId(),
                request.startAt(),
                request.endAt()
        );
    }
}