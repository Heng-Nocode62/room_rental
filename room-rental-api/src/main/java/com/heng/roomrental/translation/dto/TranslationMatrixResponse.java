package com.heng.roomrental.translation.dto;

import java.util.Map;

/** One key with its value in every language. Useful for an admin translation grid. */
public record TranslationMatrixResponse(String key, Map<String, Object> values) {}
