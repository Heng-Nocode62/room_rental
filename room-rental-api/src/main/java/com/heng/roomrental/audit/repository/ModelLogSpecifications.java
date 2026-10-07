package com.heng.roomrental.audit.repository;

import com.heng.roomrental.audit.entity.ModelLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class ModelLogSpecifications {

    private ModelLogSpecifications() {
    }

    public static Specification<ModelLog> userId(Long userId) {
        return (root, query, cb) ->
                userId == null ? null : cb.equal(root.get("userId"), userId);
    }

    public static Specification<ModelLog> modelType(String modelType) {
        return (root, query, cb) ->
                blank(modelType) ? null :
                        cb.equal(cb.lower(root.get("modelType")),
                                modelType.toLowerCase());
    }

    public static Specification<ModelLog> modelId(String modelId) {
        return (root, query, cb) ->
                blank(modelId) ? null :
                        cb.equal(root.get("modelId"), modelId);
    }

    public static Specification<ModelLog> event(String event) {
        return (root, query, cb) ->
                blank(event) ? null :
                        cb.equal(cb.lower(root.get("event")),
                                event.toLowerCase());
    }

    public static Specification<ModelLog> different(Boolean different) {
        return (root, query, cb) ->
                different == null ? null :
                        cb.equal(root.get("isDifferent"), different);
    }

    public static Specification<ModelLog> from(LocalDateTime from) {
        return (root, query, cb) ->
                from == null ? null :
                        cb.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<ModelLog> to(LocalDateTime to) {
        return (root, query, cb) ->
                to == null ? null :
                        cb.lessThanOrEqualTo(root.get("createdAt"), to);
    }

    public static Specification<ModelLog> search(String search) {
        return (root, query, cb) -> {
            if (blank(search)) {
                return null;
            }

            String pattern = "%" + search.toLowerCase() + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("modelType")), pattern),
                    cb.like(cb.lower(root.get("modelId")), pattern),
                    cb.like(cb.lower(root.get("event")), pattern),
                    cb.like(cb.lower(root.get("changes").as(String.class)), pattern)
            );
        };
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
