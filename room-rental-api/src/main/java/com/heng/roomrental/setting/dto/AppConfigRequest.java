package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AppConfigRequest(
        @NotBlank @Size(max = 255) String appName,
        @NotBlank @Pattern(regexp = "vertical|horizontal") String layout,
        @NotBlank @Pattern(regexp = "default|bordered") String skin
) {}
