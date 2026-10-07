package com.heng.roomrental.audit.hibernate;

import com.heng.roomrental.audit.service.ModelLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditIntegrator {
    private final ModelLogService modelLogService;

    public PostInsertAuditListener postInsertListener() {

        return new PostInsertAuditListener(modelLogService);
    }

    public PreUpdateAuditListener preUpdateListener() {

        return new PreUpdateAuditListener(modelLogService);
    }

    public PreDeleteAuditListener preDeleteListener() {

        return new PreDeleteAuditListener(modelLogService);
    }
}
