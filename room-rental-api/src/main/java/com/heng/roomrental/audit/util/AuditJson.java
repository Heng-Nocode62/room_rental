package com.heng.roomrental.audit.util;

import jakarta.persistence.*;
import org.hibernate.Hibernate;

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.time.temporal.Temporal;
import java.util.*;

public final class AuditJson {

    private AuditJson() {
    }

    public static Map<String, Object> snapshot(
            Object entity,
            String[] configuredFields
    ) {
        Set<String> allowed = new HashSet<>(Arrays.asList(configuredFields));
        boolean all = allowed.isEmpty();

        Map<String, Object> result = new LinkedHashMap<>();

        for (Field field : getFields(entity.getClass())) {
            if (Modifier.isStatic(field.getModifiers())
                    || field.isAnnotationPresent(Transient.class)
                    || field.isAnnotationPresent(OneToMany.class)
                    || field.isAnnotationPresent(ManyToMany.class)
                    || (field.isAnnotationPresent(OneToOne.class)
                        && field.getAnnotation(OneToOne.class).fetch() == FetchType.LAZY)
                    || (field.isAnnotationPresent(ManyToOne.class)
                        && field.getAnnotation(ManyToOne.class).fetch() == FetchType.LAZY)) {
                continue;
            }

            if (!all && !allowed.contains(field.getName())) {
                continue;
            }

            field.setAccessible(true);

            try {
                Object value = field.get(entity);
                result.put(field.getName(), safeValue(value));
            } catch (IllegalAccessException ignored) {
                // Skip inaccessible properties.
            }
        }

        return result;
    }

    public static Object safeValue(Object value) {
        if (value == null ||
                value instanceof String ||
                value instanceof Number ||
                value instanceof Boolean ||
                value instanceof Character ||
                value instanceof Enum<?> ||
                value instanceof UUID ||
                value instanceof Temporal ||
                value instanceof Date) {
            return value;
        }

        if (value instanceof Collection<?> collection) {
            return collection.stream()
                    .map(AuditJson::safeValue)
                    .toList();
        }

        if (value.getClass().isArray()) {
            int length = Array.getLength(value);
            List<Object> values = new ArrayList<>(length);
            for (int i = 0; i < length; i++) {
                values.add(safeValue(Array.get(value, i)));
            }
            return values;
        }

        if (value.getClass().isAnnotationPresent(Entity.class)) {
            return entityReference(value);
        }

        return String.valueOf(value);
    }

    public static Map<String, Object> entityReference(Object entity) {
        Map<String, Object> reference = new LinkedHashMap<>();
        reference.put("id", extractId(entity));
        reference.put("type", Hibernate.getClass(entity).getSimpleName());
        return reference;
    }

    public static Object extractId(Object entity) {
        if (entity == null) {
            return null;
        }

        Class<?> clazz = Hibernate.getClass(entity);

        for (Field field : getFields(clazz)) {
            if (field.isAnnotationPresent(Id.class)) {
                field.setAccessible(true);
                try {
                    return field.get(entity);
                } catch (IllegalAccessException ignored) {
                    return null;
                }
            }
        }

        return null;
    }

    private static List<Field> getFields(Class<?> type) {
        List<Field> fields = new ArrayList<>();

        for (Class<?> current = type;
             current != null && current != Object.class;
             current = current.getSuperclass()) {
            fields.addAll(Arrays.asList(current.getDeclaredFields()));
        }

        return fields;
    }
}
