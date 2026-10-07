package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record EditApprovedReportRequest(
        @NotNull Boolean enabled,
        @NotNull @PositiveOrZero Integer windowMinutes
) {}
