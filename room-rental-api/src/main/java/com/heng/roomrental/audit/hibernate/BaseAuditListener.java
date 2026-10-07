package com.heng.roomrental.audit.hibernate;

import com.heng.roomrental.audit.service.ModelLogService;
import org.hibernate.event.spi.*;
import java.util.*;

abstract class BaseAuditListener {
    protected final ModelLogService modelLogService;

    protected BaseAuditListener(ModelLogService modelLogService) {
        this.modelLogService = modelLogService;
    }

    protected boolean auditable(Object entity) {
        return entity != null &&
                entity.getClass().isAnnotationPresent(
                        com.heng.roomrental.audit.annotation.Auditable.class);
    }

    protected Set<String> allowedFields(Object entity) {
        var annotation = entity.getClass().getAnnotation(
                com.heng.roomrental.audit.annotation.Auditable.class);
        return new LinkedHashSet<>(Arrays.asList(annotation.fields()));
    }

    protected Map<String, Object> stateToMap(
            String[] names, Object[] state, Set<String> allowed) {

        Map<String, Object> result = new LinkedHashMap<>();

        if (state == null) return result;

        for (int i = 0; i < names.length && i < state.length; i++) {
            if (!allowed.isEmpty() && !allowed.contains(names[i])) continue;
            result.put(names[i],
                    com.heng.roomrental.audit.util.AuditJson.safeValue(state[i]));
        }

        return result;
    }

    protected Set<String> changedFields(
            String[] names, Object[] oldState, Object[] newState, Set<String> allowed) {

        Set<String> changed = new LinkedHashSet<>();

        if (oldState == null || newState == null) return changed;

        for (int i = 0; i < names.length && i < oldState.length && i < newState.length; i++) {
            if (!allowed.isEmpty() && !allowed.contains(names[i])) continue;

            Object oldValue =
                    com.heng.roomrental.audit.util.AuditJson.safeValue(oldState[i]);
            Object newValue =
                    com.heng.roomrental.audit.util.AuditJson.safeValue(newState[i]);

            if (!Objects.deepEquals(oldValue, newValue)) {
                changed.add(names[i]);
            }
        }

        return changed;
    }

    protected Object id(Object entity) {
        return com.heng.roomrental.audit.util.AuditJson.extractId(entity);
    }
}
