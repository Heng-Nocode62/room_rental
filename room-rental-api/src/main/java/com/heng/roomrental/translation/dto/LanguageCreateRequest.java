package com.heng.roomrental.translation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LanguageCreateRequest(
        @NotBlank @Size(max = 20)
        @Pattern(regexp = "^[A-Za-z]{2,20}([_-][A-Za-z0-9]{2,10})?$", message = "Invalid language code")
        String code,
        @NotBlank @Size(max = 100) String title,
        @Size(max = 2048) String flag,
        Boolean active
) {}
