package com.heng.roomrental.audit.repository;

import com.heng.roomrental.audit.entity.ActivityLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class ActivityLogSpecifications {

    private ActivityLogSpecifications() {
    }

    public static Specification<ActivityLog> userId(Long userId) {
        return (root, query, cb) ->
                userId == null ? null : cb.equal(root.get("userId"), userId);
    }

    public static Specification<ActivityLog> method(String method) {
        return (root, query, cb) ->
                isBlank(method) ? null :
                        cb.equal(root.get("method"), method.toUpperCase());
    }

    public static Specification<ActivityLog> responseStatus(Integer status) {
        return (root, query, cb) ->
                status == null ? null :
                        cb.equal(root.get("responseStatus"), status);
    }

    public static Specification<ActivityLog> from(LocalDateTime from) {
        return (root, query, cb) ->
                from == null ? null :
                        cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<ActivityLog> to(LocalDateTime to) {
        return (root, query, cb) ->
                to == null ? null :
                        cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }

    public static Specification<ActivityLog> search(String search) {
        return (root, query, cb) -> {
            if (isBlank(search)) {
                return null;
            }

            String pattern = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("url")), pattern),
                    cb.like(cb.lower(root.get("method")), pattern),
                    cb.like(cb.lower(root.get("userAgent")), pattern),
                    cb.like(cb.lower(root.get("ip")), pattern),
                    cb.like(cb.lower(root.get("requestData").as(String.class)), pattern),
                    cb.like(cb.lower(root.get("responseData").as(String.class)), pattern)
            );
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
