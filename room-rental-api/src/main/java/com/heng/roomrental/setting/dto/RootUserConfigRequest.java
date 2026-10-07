package com.heng.roomrental.setting.dto;

import jakarta.validation.constraints.Size;

public record RootUserConfigRequest(
        @Size(max = 255)
        String username
) {}
