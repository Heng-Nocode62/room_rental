package com.heng.roomrental.pricing.specification;

import com.heng.roomrental.pricing.entity.RoomPrice;
import com.heng.roomrental.pricing.entity.RoomPriceStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class RoomPriceSpecifications {

    private RoomPriceSpecifications() {
    }

    public static Specification<RoomPrice> room(
            Long roomId
    ) {

        return (root, query, cb) -> {

            if (roomId == null) {
                return null;
            }

            return cb.equal(
                    root.get("room").get("id"),
                    roomId
            );
        };
    }

    public static Specification<RoomPrice> pricingUnit(
            Long pricingUnitId
    ) {

        return (root, query, cb) -> {

            if (pricingUnitId == null) {
                return null;
            }

            return cb.equal(
                    root.get("pricingUnit").get("id"),
                    pricingUnitId
            );
        };
    }

    public static Specification<RoomPrice> status(
            RoomPriceStatus status
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

    /**
     * Find prices that are effective on a specific date.
     *
     * effective_from <= date
     *
     * AND
     *
     * effective_to IS NULL
     * OR effective_to >= date
     */
    public static Specification<RoomPrice> effectiveOn(
            LocalDate date
    ) {

        return (root, query, cb) -> {

            if (date == null) {
                return null;
            }

            return cb.and(

                    cb.lessThanOrEqualTo(
                            root.get("effectiveFrom"),
                            date
                    ),

                    cb.or(

                            cb.isNull(
                                    root.get("effectiveTo")
                            ),

                            cb.greaterThanOrEqualTo(
                                    root.get("effectiveTo"),
                                    date
                            )
                    )
            );
        };
    }

    public static Specification<RoomPrice> startsFrom(
            LocalDate date
    ) {

        return (root, query, cb) -> {

            if (date == null) {
                return null;
            }

            return cb.greaterThanOrEqualTo(
                    root.get("effectiveFrom"),
                    date
            );
        };
    }

    public static Specification<RoomPrice> startsBefore(
            LocalDate date
    ) {

        return (root, query, cb) -> {

            if (date == null) {
                return null;
            }

            return cb.lessThanOrEqualTo(
                    root.get("effectiveFrom"),
                    date
            );
        };
    }
}