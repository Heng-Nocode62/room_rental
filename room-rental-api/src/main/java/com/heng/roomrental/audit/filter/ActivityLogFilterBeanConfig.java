package com.heng.roomrental.audit.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.config.AuditProperties;
import com.heng.roomrental.audit.service.ActivityLogService;
import com.heng.roomrental.audit.service.AuditUserProvider;
import com.heng.roomrental.security.CurrentUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ActivityLogFilterBeanConfig {
    @Bean
    public ActivityLogFilter activityLogFilter(
            ActivityLogService activityLogService,
            ObjectMapper objectMapper,
            AuditProperties auditProperties,
            AuditUserProvider auditUserProvider
    ) {
        return new ActivityLogFilter(
                activityLogService,
                objectMapper,
                auditProperties,
                auditUserProvider
        );
    }

}
