package com.heng.roomrental.audit.hibernate;

import com.heng.roomrental.audit.service.ModelLogService;
import org.hibernate.event.spi.PreDeleteEvent;
import org.hibernate.event.spi.PreDeleteEventListener;

import java.util.*;

public class PreDeleteAuditListener extends BaseAuditListener
        implements PreDeleteEventListener {

    public PreDeleteAuditListener(ModelLogService modelLogService) {
        super(modelLogService);
    }

    @Override
    public boolean onPreDelete(PreDeleteEvent event) {
        Object entity = event.getEntity();
        if (!auditable(entity)) return false;

        String[] names = event.getPersister().getPropertyNames();
        Set<String> allowed = allowedFields(entity);

        Map<String, Object> oldValues =
                stateToMap(names, event.getDeletedState(), allowed);

        modelLogService.log(
                entity.getClass().getSimpleName(),
                id(entity),
                "DELETE",
                oldValues,
                Collections.emptyMap(),
                new LinkedHashSet<>(oldValues.keySet())
        );

        return false;
    }
}
