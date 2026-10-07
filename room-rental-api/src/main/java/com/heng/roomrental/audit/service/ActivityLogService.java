package com.heng.roomrental.audit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.entity.ActivityLog;
import com.heng.roomrental.audit.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {
    private final ActivityLogRepository repository;
    private final ObjectMapper objectMapper;

    public void save(Long userId, String method, String url, Object requestData,
                     Object responseData, String ip, String userAgent,
                     Integer responseStatus) {
        try {
            repository.save(ActivityLog.builder()
                    .userId(userId)
                    .method(method)
                    .url(url)
                    .requestData(toJsonNode(requestData))
                    .responseData(toJsonNode(responseData))
                    .ip(ip)
                    .userAgent(userAgent)
                    .responseStatus(responseStatus)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        } catch (Exception ex) {
            log.error("Could not persist activity log", ex);
        }
    }

    private JsonNode toJsonNode(Object value) {
        if (value == null) return null;
        try {
            if (value instanceof JsonNode node) return node;
            if (value instanceof String s) {
                return s.isBlank() ? null : objectMapper.readTree(s);
            }
            return objectMapper.valueToTree(value);
        } catch (Exception ex) {
            log.warn("Could not convert audit data to JSON", ex);
            return null;
        }
    }
}
