package com.heng.roomrental.room.specification;

import com.heng.roomrental.room.dto.AmenitySearchRequest;
import com.heng.roomrental.room.entity.Amenity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class AmenitySpecification {

    private AmenitySpecification() {
    }

    public static Specification<Amenity> filter(
            AmenitySearchRequest request,
            Long locationId
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            /*
             * Location filter
             */
            if (locationId != null) {
                predicates.add(
                        cb.equal(
                                root.get("location").get("id"),
                                locationId
                        )
                );
            }

            /*
             * Name search
             */
            if (request != null
                    && request.getName() != null
                    && !request.getName().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("name")),
                                "%" + request.getName().trim().toLowerCase() + "%"
                        )
                );
            }

            /*
             * Status
             */
            if (request != null
                    && request.getStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus()
                        )
                );
            }

            /*
             * Minimum price
             */
            if (request != null
                    && request.getMinPrice() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("price"),
                                request.getMinPrice()
                        )
                );
            }

            /*
             * Maximum price
             */
            if (request != null
                    && request.getMaxPrice() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("price"),
                                request.getMaxPrice()
                        )
                );
            }

            /*
             * Minimum stock
             */
            if (request != null
                    && request.getMinStock() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("stockQuantity"),
                                request.getMinStock()
                        )
                );
            }

            /*
             * Maximum stock
             */
            if (request != null
                    && request.getMaxStock() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("stockQuantity"),
                                request.getMaxStock()
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}