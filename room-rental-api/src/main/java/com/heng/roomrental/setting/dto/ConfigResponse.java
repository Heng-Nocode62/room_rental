package com.heng.roomrental.setting.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.heng.roomrental.setting.entity.AppConfig;

import java.time.LocalDateTime;

public record ConfigResponse(
        Long id,
        String key,
        JsonNode value,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ConfigResponse from(AppConfig config) {
        return new ConfigResponse(
                config.getId(),
                config.getKey(),
                config.getValue(),
                config.getDescription(),
                config.getCreatedAt(),
                config.getUpdatedAt()
        );
    }
}
