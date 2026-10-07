package com.heng.roomrental.audit.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heng.roomrental.audit.entity.ModelLog;
import java.time.LocalDateTime;

public record ModelLogResponse(
        Long id, String modelType, String modelId, String event,
        Boolean isDifferent, Object changes, Long userId, String userName,
        LocalDateTime createdAt) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static ModelLogResponse from(ModelLog log) {
        return new ModelLogResponse(log.getId(), log.getModelType(), log.getModelId(),
                log.getEvent(), log.getIsDifferent(), toPlain(log.getChanges()),
                log.getUserId(),null, log.getCreatedAt());
    }

    private static Object toPlain(JsonNode node) {
        return (node == null || node.isNull()) ? null : MAPPER.convertValue(node, Object.class);
    }
}
