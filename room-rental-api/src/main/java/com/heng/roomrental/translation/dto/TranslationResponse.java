package com.heng.roomrental.translation.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.heng.roomrental.translation.entity.Translation;

public record TranslationResponse(
        Long id, Long languageId, String languageCode,
        String key, String value, boolean active
) {
    public static TranslationResponse from(Translation t) {
        return new TranslationResponse(t.getId(), t.getLanguage().getId(),
                t.getLanguage().getCode(), t.getKey(), t.getValue() == null? null: t.getValue().asText(), t.isActive());
    }
}
