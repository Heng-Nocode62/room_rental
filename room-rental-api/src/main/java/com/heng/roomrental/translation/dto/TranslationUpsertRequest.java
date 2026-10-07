package com.heng.roomrental.translation.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TranslationUpsertRequest(
        @NotBlank @Size(max = 255) String key,
        @NotNull Object value,
        Boolean active
) {}
