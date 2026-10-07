package com.heng.roomrental.pricing.service;

import com.heng.roomrental.pricing.dto.PriceCalculationResult;
import com.heng.roomrental.room.entity.Room;

import java.time.OffsetDateTime;

public interface PricingCalculationService {
    PriceCalculationResult calculate(
            Room room,
            Short pricingUnitId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    );
}
