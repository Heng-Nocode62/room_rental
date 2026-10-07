package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FontRequest(
        @NotNull @Positive Integer active
) {}
