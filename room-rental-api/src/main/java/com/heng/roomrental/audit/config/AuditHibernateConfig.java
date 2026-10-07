package com.heng.roomrental.audit.config;

import com.heng.roomrental.audit.hibernate.AuditIntegrator;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class AuditHibernateConfig {
    private final EntityManagerFactory entityManagerFactory;
    private final AuditIntegrator auditIntegrator;

    @PostConstruct
    public void registerListeners() {
        SessionFactoryImplementor sessionFactory =
                entityManagerFactory.unwrap(SessionFactoryImplementor.class);

        EventListenerRegistry registry = sessionFactory.getServiceRegistry()
                .getService(EventListenerRegistry.class);

        registry.getEventListenerGroup(EventType.POST_INSERT)
                .appendListener(auditIntegrator.postInsertListener());

        registry.getEventListenerGroup(EventType.PRE_UPDATE)
                .appendListener(auditIntegrator.preUpdateListener());

        registry.getEventListenerGroup(EventType.PRE_DELETE)
                .appendListener(auditIntegrator.preDeleteListener());
    }
}
