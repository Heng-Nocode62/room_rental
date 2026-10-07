package com.heng.roomrental.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.entity.ModelLog;
import com.heng.roomrental.audit.repository.ModelLogRepository;
import com.heng.roomrental.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ModelLogService {
    private final ModelLogRepository repository;
    private final ObjectMapper objectMapper;
   private final AuditUserProvider auditUserProvider;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String modelType, Object modelId, String event,
                    Map<String, Object> oldValues,
                    Map<String, Object> newValues,
                    Set<String> changedFields) {
        try {
            Map<String, Object> changes = new LinkedHashMap<>();
            changes.put("old", oldValues);
            changes.put("new", newValues);
            changes.put("changed_fields", changedFields);

            Optional<Long> userId = auditUserProvider.getUserId();
            repository.save(ModelLog.builder()
                    .modelType(modelType)
                    .modelId(modelId == null ? null : modelId.toString())
                    .event(event)
                    .isDifferent(!changedFields.isEmpty())
                    .changes(objectMapper.valueToTree(changes))
                    .userId(userId.orElse(null))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        } catch (Exception ex) {
            log.error("Could not persist model log for {} {}", modelType, modelId, ex);
        }
    }

    public void logDirectUpdate(String modelType, Object modelId,
                                Map<String, Object> oldValues,
                                Map<String, Object> newValues) {
        Set<String> changed = newValues.keySet().stream()
                .filter(k -> !Objects.equals(oldValues.get(k), newValues.get(k)))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        log(modelType, modelId, "UPDATE", oldValues, newValues, changed);
    }
}
