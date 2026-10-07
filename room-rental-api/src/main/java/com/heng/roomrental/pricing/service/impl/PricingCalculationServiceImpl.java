package com.heng.roomrental.pricing.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.repository.LocationOperatingHoursRepository;
import com.heng.roomrental.pricing.dto.PriceCalculationResult;
import com.heng.roomrental.pricing.entity.PricingUnit;
import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import com.heng.roomrental.pricing.repository.PricingUnitRepository;
import com.heng.roomrental.pricing.repository.RoomPriceRepository;
import com.heng.roomrental.pricing.service.PricingCalculationService;
import com.heng.roomrental.room.entity.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class PricingCalculationServiceImpl implements PricingCalculationService {

    private final PricingUnitRepository pricingUnitRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final LocationOperatingHoursRepository operatingHoursRepository;
    @Override
    public PriceCalculationResult calculate(
            Room room,
            Short pricingUnitId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        if (!endAt.isAfter(startAt)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        PricingUnit pricingUnit = pricingUnitRepository.findById(pricingUnitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pricing unit not found: "
                                        + pricingUnitId
                        )
                );

        LocalDate pricingDate = startAt.toLocalDate();
        RoomPrice roomPrice = roomPriceRepository
                .findFirstByRoomIdAndPricingUnitIdAndStatusAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
                        room.getId(),
                        pricingUnit.getId(),
                        RoomPriceStatus.ACTIVE,
                        pricingDate
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No active price found for room "
                                        + room.getRoomNumber()
                                        + " and pricing unit "
                                        + pricingUnit.getCode()
                        )
                );

        BigDecimal totalAmount = calculateTotal(
                roomPrice.getPrice(),
                pricingUnit.getCode(),
                room,
                startAt,
                endAt
        );

        return new PriceCalculationResult(
                pricingUnit,
                roomPrice.getPrice(),
                totalAmount,
                roomPrice.getCurrencyCode()
        );
    }

    private BigDecimal calculateTotal(
            BigDecimal unitPrice,
            String pricingCode,
            Room room,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        Duration duration =
                Duration.between(startAt, endAt);

        return switch (pricingCode) {

            case "HOURLY" -> calculateHourly(
                    unitPrice,
                    duration
            );

            case "DAILY" -> calculateDaily(
                    unitPrice,
                    room,
                    startAt,
                    endAt
            );

            default -> throw new IllegalArgumentException(
                    "Unsupported pricing unit: " + pricingCode
            );
        };
    }

    private BigDecimal calculateHourly(
            BigDecimal unitPrice,
            Duration duration
    ) {

        long minutes = duration.toMinutes();

        if (minutes <= 0) {
            throw new IllegalArgumentException(
                    "Reservation duration must be positive"
            );
        }

        long hours =
                (long) Math.ceil(minutes / 60.0);

        return unitPrice
                .multiply(BigDecimal.valueOf(hours))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateDaily(
            BigDecimal unitPrice,
            Room room,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        LocalDate startDate = startAt.toLocalDate();
        LocalDate endDate = endAt.toLocalDate();

        long operatingDays = startDate
                .datesUntil(endDate.plusDays(1))
                .filter(date -> isOperatingDay(room, date))
                .count();

        if (operatingDays <= 0) {
            throw new IllegalArgumentException(
                    "No operating days in the selected period."
            );
        }

        return unitPrice
                .multiply(BigDecimal.valueOf(operatingDays))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private boolean isOperatingDay(
            Room room,
            LocalDate date
    ) {

        return operatingHoursRepository
                .findByLocationIdAndDayOfWeek(
                        room.getLocation().getId(),
                        (short) date.getDayOfWeek().getValue()
                )
                .map(hours -> !hours.isClosed())
                .orElse(false);
    }


}
