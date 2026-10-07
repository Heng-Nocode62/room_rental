package com.heng.roomrental.audit.service;

import java.util.Optional;

public interface AuditUserProvider {
    Optional<Long> getUserId();
}
