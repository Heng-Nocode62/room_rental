package com.heng.roomrental.translation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record GlobalTranslationRequest(
        @NotBlank @Size(max = 255) String key,
        @NotEmpty Map<Long, String> values
) {}
