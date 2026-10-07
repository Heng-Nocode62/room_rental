package com.heng.roomrental.user.specification;

import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> keyword(
            String keyword
    ) {

        return (root, query, cb) -> {

            if (keyword == null
                    || keyword.isBlank()) {
                return null;
            }

            String value =
                    "%" +
                    keyword.trim()
                            .toLowerCase() +
                    "%";

            return cb.or(

                    cb.like(
                            cb.lower(
                                    root.get("username")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("firstName")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("lastName")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("email")
                            ),
                            value
                    ),

                    cb.like(
                            cb.lower(
                                    root.get("phone")
                            ),
                            value
                    )
            );
        };
    }


    public static Specification<User> status(
            UserStatus status
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


    public static Specification<User> role(
            Long roleId
    ) {

        return (root, query, cb) -> {

            if (roleId == null) {
                return null;
            }

            query.distinct(true);

            return cb.equal(
                    root.join("roles")
                            .get("id"),
                    roleId
            );
        };
    }
}