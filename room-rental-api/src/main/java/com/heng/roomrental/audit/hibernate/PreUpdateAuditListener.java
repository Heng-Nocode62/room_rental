package com.heng.roomrental.audit.hibernate;

import com.heng.roomrental.audit.service.ModelLogService;
import org.hibernate.event.spi.PreUpdateEvent;
import org.hibernate.event.spi.PreUpdateEventListener;

import java.util.*;

public class PreUpdateAuditListener extends BaseAuditListener
        implements PreUpdateEventListener {

    public PreUpdateAuditListener(ModelLogService modelLogService) {
        super(modelLogService);
    }

    @Override
    public boolean onPreUpdate(PreUpdateEvent event) {
        Object entity = event.getEntity();
        if (!auditable(entity) || event.getOldState() == null) return false;

        String[] names = event.getPersister().getPropertyNames();
        Set<String> allowed = allowedFields(entity);

        Map<String, Object> oldValues =
                stateToMap(names, event.getOldState(), allowed);

        Map<String, Object> newValues =
                stateToMap(names, event.getState(), allowed);

        Set<String> changed =
                changedFields(names, event.getOldState(), event.getState(), allowed);

        if (changed.isEmpty()) return false;

        modelLogService.log(
                entity.getClass().getSimpleName(),
                id(entity),
                "UPDATE",
                oldValues,
                newValues,
                changed
        );

        return false;
    }
}
