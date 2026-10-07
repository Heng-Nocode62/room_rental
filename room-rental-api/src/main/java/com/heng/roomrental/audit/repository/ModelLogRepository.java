package com.heng.roomrental.audit.repository;

import com.heng.roomrental.audit.entity.ModelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ModelLogRepository
        extends JpaRepository<ModelLog, Long>,
                JpaSpecificationExecutor<ModelLog> {
}
