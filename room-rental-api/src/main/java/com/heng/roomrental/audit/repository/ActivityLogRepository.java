package com.heng.roomrental.audit.repository;

import com.heng.roomrental.audit.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ActivityLogRepository
        extends JpaRepository<ActivityLog, Long>,
                JpaSpecificationExecutor<ActivityLog> {
}
