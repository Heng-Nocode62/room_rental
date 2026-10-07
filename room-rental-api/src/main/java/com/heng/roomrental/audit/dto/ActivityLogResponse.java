package com.heng.roomrental.audit.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.entity.ActivityLog;
import java.time.LocalDateTime;

public record ActivityLogResponse(
        Long id, Long userId, String method, String url,
        Object requestData, Object responseData, String ip,
        String userAgent, Integer responseStatus, LocalDateTime createdAt) {

    // Plain Jackson mapper, used only to unwrap JsonNode into ordinary
    // Map/List/primitive values so these fields serialize correctly no
    // matter which JSON writeTP response.r ends up handling the HT
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static ActivityLogResponse from(ActivityLog log) {
        return new ActivityLogResponse(log.getId(), log.getUserId(), log.getMethod(),
                log.getUrl(), toPlain(log.getRequestData()), toPlain(log.getResponseData()),
                log.getIp(), log.getUserAgent(), log.getResponseStatus(),
                log.getCreatedAt());
    }

    private static Object toPlain(JsonNode node) {
        return (node == null || node.isNull()) ? null : MAPPER.convertValue(node, Object.class);
    }
}
