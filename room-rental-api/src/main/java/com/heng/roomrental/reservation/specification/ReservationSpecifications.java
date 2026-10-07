package com.heng.roomrental.reservation.specification;

import com.heng.roomrental.reservation.entity.Reservation;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;

public final class ReservationSpecifications {

    private ReservationSpecifications() {
    }

    public static Specification<Reservation> keyword(
            String keyword
    ) {

        return (root, query, cb) -> {

            if (keyword == null || keyword.isBlank()) {
                return null;
            }

            String value =
                    "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(
                    cb.like(
                            cb.lower(
                                    root.get("referenceNo")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("contactName")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("companyName")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("contactPhone")
                            ),
                            value
                    )
            );
        };
    }


    public static Specification<Reservation> room(
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


    public static Specification<Reservation> location(
            Long locationId
    ) {

        return (root, query, cb) -> {

            if (locationId == null) {
                return null;
            }

            return cb.equal(
                    root.get("room")
                            .get("location")
                            .get("id"),
                    locationId
            );
        };
    }


    public static Specification<Reservation> status(
            String status
    ) {

        return (root, query, cb) -> {

            if (status == null || status.isBlank()) {
                return null;
            }

            return cb.equal(
                    root.get("status").get("code"),
                    status.trim().toUpperCase()
            );
        };
    }


    public static Specification<Reservation> pricingUnit(
            Short pricingUnitId
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


    /**
     * Finds reservations that overlap a particular calendar date.
     *
     * Example:
     *
     * date = 2026-08-25
     *
     * range:
     * 2026-08-25T00:00
     * ->
     * 2026-08-26T00:00
     */
    public static Specification<Reservation> date(
            OffsetDateTime dayStart,
            OffsetDateTime dayEnd
    ) {

        return (root, query, cb) -> {

            if (dayStart == null || dayEnd == null) {
                return null;
            }

            return cb.and(

                    cb.lessThan(
                            root.get("startAt"),
                            dayEnd
                    ),

                    cb.greaterThan(
                            root.get("endAt"),
                            dayStart
                    )
            );
        };
    }


    public static Specification<Reservation> fromDate(
            OffsetDateTime from
    ) {

        return (root, query, cb) -> {

            if (from == null) {
                return null;
            }

            return cb.greaterThanOrEqualTo(
                    root.get("startAt"),
                    from
            );
        };
    }


    public static Specification<Reservation> toDate(
            OffsetDateTime to
    ) {

        return (root, query, cb) -> {

            if (to == null) {
                return null;
            }

            return cb.lessThan(
                    root.get("startAt"),
                    to
            );
        };
    }
}