package com.heng.roomrental.pricing.controller;

import com.heng.roomrental.pricing.dto.RoomPriceResponse;
import com.heng.roomrental.pricing.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/prices")
@RequiredArgsConstructor
public class RoomPriceHistoryController {

    private final PricingService pricingService;

    @GetMapping
    public List<RoomPriceResponse> getHistory(
            @PathVariable Long roomId
    ) {
        return pricingService
                .getRoomPriceHistory(roomId);
    }
}