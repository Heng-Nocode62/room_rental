package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CmsConfigRequest(
        @NotBlank
        @Size(max = 500)
        String baseUrl,

        @NotBlank
        @Size(max = 255)
        String clientKey,

        @NotBlank
        @Size(max = 255)
        String secretKey,

        @Size(max = 500)
        String token
) {}
