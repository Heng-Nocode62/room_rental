package com.heng.roomrental.pricing.dto;

import com.heng.roomrental.pricing.entity.PricingUnit;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PriceCalculationResult(
        PricingUnit pricingUnit,
        BigDecimal unitPrice,
        BigDecimal totalAmount,
        String currencyCode
) {
}