package com.heng.roomrental.room.specification;

import com.heng.roomrental.pricing.entity.PricingUnit;
import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import com.heng.roomrental.room.entity.Amenity;
import com.heng.roomrental.room.entity.AmenityStatus;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomAmenity;
import com.heng.roomrental.room.entity.RoomStatus;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

public final class RoomSpecifications {

    private RoomSpecifications() {
    }

    public static Specification<Room> keyword(
            String keyword
    ) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String value =
                    "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";

            return cb.or(
                    cb.like(
                            cb.lower(root.get("roomNumber")),
                            value
                    ),
                    cb.like(
                            cb.lower(root.get("name")),
                            value
                    ),
                    cb.like(
                            cb.lower(root.get("floor")),
                            value
                    ),
                    cb.like(
                            cb.lower(root.get("description")),
                            value
                    )
            );
        };
    }

    public static Specification<Room> location(
            Long locationId
    ) {
        return (root, query, cb) -> {
            if (locationId == null) {
                return null;
            }

            return cb.equal(
                    root.get("location").get("id"),
                    locationId
            );
        };
    }

    public static Specification<Room> roomType(
            Long roomTypeId
    ) {
        return (root, query, cb) -> {
            if (roomTypeId == null) {
                return null;
            }

            return cb.equal(
                    root.get("roomType").get("id"),
                    roomTypeId
            );
        };
    }

    public static Specification<Room> status(
            RoomStatus status
    ) {
        return (root, query, cb) -> {
            if (status == null) {
                return null;
            }

            return cb.equal(
                    root.get("status"),
                    status
            );
        };
    }

    public static Specification<Room> minCapacity(
            Integer minCapacity
    ) {
        return (root, query, cb) -> {
            if (minCapacity == null) {
                return null;
            }

            return cb.greaterThanOrEqualTo(
                    root.get("roomType").get("capacity"),
                    minCapacity
            );
        };
    }

    public static Specification<Room> maxCapacity(
            Integer maxCapacity
    ) {
        return (root, query, cb) -> {
            if (maxCapacity == null) {
                return null;
            }

            return cb.lessThanOrEqualTo(
                    root.get("roomType").get("capacity"),
                    maxCapacity
            );
        };
    }

    public static Specification<Room> floors(
            List<String> floors
    ) {
        if (floors == null || floors.isEmpty()) {
            return null;
        }

        List<String> normalized = floors.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> value.toLowerCase(Locale.ROOT))
                .distinct()
                .toList();

        if (normalized.isEmpty()) {
            return null;
        }

        return (root, query, cb) ->
                cb.lower(root.get("floor")).in(normalized);
    }

    public static Specification<Room> amenities(
            List<Long> amenityIds
    ) {
        if (amenityIds == null || amenityIds.isEmpty()) {
            return null;
        }

        List<Long> ids = amenityIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (ids.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (Long amenityId : ids) {
                Subquery<Integer> subquery =
                        query.subquery(Integer.class);

                Root<RoomAmenity> roomAmenity =
                        subquery.from(RoomAmenity.class);

                Join<RoomAmenity, Amenity> amenity =
                        roomAmenity.join("amenity");

                subquery.select(cb.literal(1));

                subquery.where(
                        cb.equal(
                                roomAmenity.get("room").get("id"),
                                root.get("id")
                        ),
                        cb.equal(
                                amenity.get("id"),
                                amenityId
                        ),
                        cb.equal(
                                amenity.get("status"),
                                AmenityStatus.ACTIVE
                        )
                );

                predicates.add(cb.exists(subquery));
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    public static Specification<Room> hourlyPriceRange(
            BigDecimal minHourlyPrice,
            BigDecimal maxHourlyPrice,
            LocalDate effectiveDate
    ) {
        if (minHourlyPrice == null && maxHourlyPrice == null) {
            return null;
        }

        LocalDate priceDate =
                effectiveDate != null
                        ? effectiveDate
                        : LocalDate.now();

        return (root, query, cb) -> {
            Subquery<Integer> subquery =
                    query.subquery(Integer.class);

            Root<RoomPrice> roomPrice =
                    subquery.from(RoomPrice.class);

            Join<RoomPrice, PricingUnit> pricingUnit =
                    roomPrice.join("pricingUnit");

            List<Predicate> predicates =
                    new ArrayList<>();

            predicates.add(
                    cb.equal(
                            roomPrice.get("room").get("id"),
                            root.get("id")
                    )
            );

            predicates.add(
                    cb.equal(
                            pricingUnit.get("code"),
                            "HOURLY"
                    )
            );

            predicates.add(
                    cb.equal(
                            roomPrice.get("status"),
                            RoomPriceStatus.ACTIVE
                    )
            );

            predicates.add(
                    cb.lessThanOrEqualTo(
                            roomPrice.<LocalDate>get("effectiveFrom"),
                            priceDate
                    )
            );

            predicates.add(
                    cb.or(
                            cb.isNull(
                                    roomPrice.get("effectiveTo")
                            ),
                            cb.greaterThanOrEqualTo(
                                    roomPrice.<LocalDate>get("effectiveTo"),
                                    priceDate
                            )
                    )
            );

            if (minHourlyPrice != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                roomPrice.<BigDecimal>get("price"),
                                minHourlyPrice
                        )
                );
            }

            if (maxHourlyPrice != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                roomPrice.<BigDecimal>get("price"),
                                maxHourlyPrice
                        )
                );
            }

            subquery.select(cb.literal(1));

            subquery.where(
                    predicates.toArray(new Predicate[0])
            );

            return cb.exists(subquery);
        };
    }
}