package com.heng.roomrental.translation.dto;

import java.util.Map;

public record PublicTranslationResponse(
        String language,
        String title,
        String flag,
        Map<String, Object> data
) {}
