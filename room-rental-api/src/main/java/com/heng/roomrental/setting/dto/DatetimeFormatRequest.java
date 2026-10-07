package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DatetimeFormatRequest(
        @NotNull @Positive Integer active
) {}
