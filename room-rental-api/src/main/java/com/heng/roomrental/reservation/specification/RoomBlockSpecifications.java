package com.heng.roomrental.reservation.specification;

import com.heng.roomrental.reservation.entity.RoomBlock;
import com.heng.roomrental.reservation.entity.RoomBlockStatus;
import com.heng.roomrental.reservation.entity.RoomBlockType;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;

public final class RoomBlockSpecifications {

    private RoomBlockSpecifications() {
    }

    public static Specification<RoomBlock> keyword(
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
                                    root.get("reason")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("notes")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("room")
                                            .get("roomNumber")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("room")
                                            .get("name")
                            ),
                            value
                    )
            );
        };
    }


    public static Specification<RoomBlock> room(
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


    public static Specification<RoomBlock> location(
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


    public static Specification<RoomBlock> blockType(
            RoomBlockType blockType
    ) {

        return (root, query, cb) -> {

            if (blockType == null) {
                return null;
            }

            return cb.equal(
                    root.get("blockType"),
                    blockType
            );
        };
    }


    public static Specification<RoomBlock> status(
            RoomBlockStatus status
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


    public static Specification<RoomBlock> overlaps(
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        return (root, query, cb) -> {

            if (startAt == null || endAt == null) {
                return null;
            }

            return cb.and(

                    cb.lessThan(
                            root.get("startAt"),
                            endAt
                    ),

                    cb.greaterThan(
                            root.get("endAt"),
                            startAt
                    )
            );
        };
    }


    public static Specification<RoomBlock> startsFrom(
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


    public static Specification<RoomBlock> startsBefore(
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