package com.heng.roomrental.translation.dto;

import com.heng.roomrental.translation.entity.Language;

public record LanguageResponse(
        Long id, String code, String title, String flag,
        boolean active, long translationCount
) {
    public static LanguageResponse from(Language l, long count) {
        return new LanguageResponse(l.getId(), l.getCode(), l.getTitle(), l.getFlag(),
                l.isActive(), count);
    }
}
