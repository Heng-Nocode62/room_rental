package com.heng.roomrental.pricing.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.web.SortValidator;
import com.heng.roomrental.location.repository.LocationOperatingHoursRepository;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.pricing.dto.*;
import com.heng.roomrental.pricing.entity.PricingUnit;
import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import com.heng.roomrental.pricing.repository.PricingUnitRepository;
import com.heng.roomrental.pricing.repository.RoomPriceRepository;
import com.heng.roomrental.pricing.service.PricingService;
import com.heng.roomrental.pricing.specification.RoomPriceSpecifications;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final PricingUnitRepository pricingUnitRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final RoomRepository roomRepository;
    private final SortValidator sortValidator;
    private final LocationSecurity locationSecurity;


    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_CREATE')")
    @Transactional
    public RoomPriceResponse createPrice(
            CreateRoomPriceRequest request
    ) {

        validateEffectiveDates(
                request.effectiveFrom(),
                request.effectiveTo()
        );
        Room room = roomRepository.findById(
                        request.roomId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found: "
                                        + request.roomId()
                        )
                );
        locationSecurity.validateOwner(room.getLocation().getId());

        PricingUnit pricingUnit = pricingUnitRepository.findById(
                        request.pricingUnitId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pricing unit not found: "
                                        + request.pricingUnitId()
                        )
                );
        boolean overlap = roomPriceRepository
                        .existsOverlappingPrice(
                                room.getId(),
                                pricingUnit.getId(),
                                request.effectiveFrom(),
                                request.effectiveTo()
                        );

        if (overlap) {
            throw new ConflictException(
                    "PRICE_PERIOD_OVERLAP",
                    "A price already exists for "
                            + "this room and pricing unit "
                            + "during the selected period."
            );
        }

        RoomPrice roomPrice = new RoomPrice();
        roomPrice.setRoom(room);
        roomPrice.setPricingUnit(pricingUnit);
        roomPrice.setPrice(request.price());

        roomPrice.setCurrencyCode(
                request.currencyCode()
                        .trim()
                        .toUpperCase()
        );

        roomPrice.setEffectiveFrom(request.effectiveFrom());

        roomPrice.setEffectiveTo(request.effectiveTo());

        roomPrice.setStatus(
                RoomPriceStatus.ACTIVE
        );

        RoomPrice saved =
                roomPriceRepository.save(
                        roomPrice
                );

        return toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_VIEW')")
    @Transactional(readOnly = true)
    public RoomPriceResponse getPrice(
            Long id
    ) {

        return toResponse(
                getEntityById(id)
        );
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_VIEW')")
    @Transactional(readOnly = true)
    public Page<RoomPriceResponse> search(
            RoomPriceSearchRequest request,
            Pageable pageable
    ) {

        sortValidator.validate(
                pageable,
                Set.of(
                        "effectiveFrom",
                        "effectiveTo",
                        "price",
                        "createdAt"
                )
        );
        Specification<RoomPrice> specification =
                Specification.allOf(

                        RoomPriceSpecifications.room(
                                request.roomId()
                        ),

                        RoomPriceSpecifications.pricingUnit(
                                request.pricingUnitId()
                        ),

                        RoomPriceSpecifications.status(
                                request.status()
                        ),

                        RoomPriceSpecifications.effectiveOn(
                                request.effectiveDate()
                        ),

                        RoomPriceSpecifications.startsFrom(
                                request.fromDate()
                        ),

                        RoomPriceSpecifications.startsBefore(
                                request.toDate()
                        )
                );

        return roomPriceRepository
                .findAll(
                        specification,
                        pageable
                )
                .map(this::toResponse);
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_VIEW')")
    @Transactional(readOnly = true)
    public List<RoomPriceResponse> getRoomPriceHistory(
            Long roomId
    ) {

        roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found: " + roomId
                        )
                );

        return roomPriceRepository
                .findByRoomIdOrderByEffectiveFromDesc(
                        roomId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_UPDATE')")
    @Transactional
    public RoomPriceResponse updatePrice(
            Long id,
            UpdateRoomPriceRequest request
    ) {

        RoomPrice roomPrice =
                getEntityById(id);
        locationSecurity.validateOwner(roomPrice.getRoom().getLocation().getId());

        if (roomPrice.getStatus()
                != RoomPriceStatus.ACTIVE) {

            throw new InvalidOperationException(
                    "PRICE_NOT_ACTIVE",
                    "Only active prices can be updated."
            );
        }

        roomPrice.setPrice(
                request.price()
        );

        roomPrice.setCurrencyCode(
                request.currencyCode()
                        .trim()
                        .toUpperCase()
        );

        return toResponse(
                roomPriceRepository.save(
                        roomPrice
                )
        );
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_PRICE_DEACTIVATE')")
    @Transactional
    public void deactivatePrice(
            Long id
    ) {

        RoomPrice roomPrice =
                getEntityById(id);
        locationSecurity.validateOwner(roomPrice.getRoom().getLocation().getId());
        if (roomPrice.getStatus()
                != RoomPriceStatus.ACTIVE) {

            throw new InvalidOperationException(
                    "PRICE_NOT_ACTIVE",
                    "Price is already inactive."
            );
        }

        roomPrice.setStatus(
                RoomPriceStatus.INACTIVE
        );

        roomPriceRepository.save(
                roomPrice
        );
    }

    private RoomPriceResponse toResponse(RoomPrice roomPrice) {
        return new RoomPriceResponse(
                roomPrice.getId(),
                roomPrice.getRoom().getId(),
                roomPrice.getRoom().getRoomNumber(),
                roomPrice.getPricingUnit().getId(),
                roomPrice.getPricingUnit().getCode(),
                roomPrice.getPricingUnit().getName(),
                roomPrice.getPrice(),
                roomPrice.getCurrencyCode(),
                roomPrice.getEffectiveFrom(),
                roomPrice.getEffectiveTo(),
                roomPrice.getStatus().name()
        );
    }


    private RoomPrice getEntityById(
            Long id
    ) {

        return roomPriceRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room price not found: "
                                        + id
                        )
                );
    }

    private void validateEffectiveDates(
            LocalDate effectiveFrom,
            LocalDate effectiveTo
    ) {

        if (effectiveFrom == null) {

            throw new IllegalArgumentException(
                    "Effective-from date is required."
            );
        }

        if (effectiveTo != null
                && effectiveTo.isBefore(
                effectiveFrom
        )) {

            throw new InvalidOperationException(
                    "INVALID_PRICE_PERIOD",
                    "Effective-to date must be "
                            + "on or after effective-from date."
            );
        }
    }
}