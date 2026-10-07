package com.heng.roomrental.location.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateLocationRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotBlank
        @Size(max = 50)
        String code,

        String address,

        @Size(max = 30)
        String phone,

        @NotBlank
        @Size(max = 64)
        String timeZone
) {
}