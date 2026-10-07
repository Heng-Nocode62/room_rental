package com.heng.roomrental.audit.hibernate;

import com.heng.roomrental.audit.service.ModelLogService;
import org.hibernate.event.spi.PostInsertEvent;
import org.hibernate.event.spi.PostInsertEventListener;

import java.util.*;

public class PostInsertAuditListener extends BaseAuditListener
        implements PostInsertEventListener {

    public PostInsertAuditListener(ModelLogService modelLogService) {
        super(modelLogService);
    }

    @Override
    public void onPostInsert(PostInsertEvent event) {
        Object entity = event.getEntity();
        if (!auditable(entity)) return;

        String[] names = event.getPersister().getPropertyNames();
        Set<String> allowed = allowedFields(entity);

        Map<String, Object> newValues =
                stateToMap(names, event.getState(), allowed);

        modelLogService.log(
                entity.getClass().getSimpleName(),
                id(entity),
                "CREATE",
                Collections.emptyMap(),
                newValues,
                new LinkedHashSet<>(newValues.keySet())
        );
    }

    @Override
    public boolean requiresPostCommitHandling(
            org.hibernate.persister.entity.EntityPersister persister) {
        return false;
    }
}
