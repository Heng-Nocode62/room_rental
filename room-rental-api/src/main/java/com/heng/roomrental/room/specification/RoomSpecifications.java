package com.heng.roomrental.room.specification;

import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

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
                    "%" + keyword.trim().toLowerCase() + "%";

            return cb.or(

                    cb.like(
                            cb.lower(
                                    root.get("roomNumber")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("name")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("floor")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("description")
                            ),
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


    public static Specification<Room> amenity(
            Long amenityId
    ) {

        return (root, query, cb) -> {

            if (amenityId == null) {
                return null;
            }

            query.distinct(true);

            Join<Object, Object> roomAmenities =
                    root.join("amenities");
            Join<Object, Object> amenity =
                    roomAmenities.join("amenity");

            return cb.equal(
                    amenity.get("id"),
                    amenityId
            );
        };
    }
}