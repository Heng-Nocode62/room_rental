package com.heng.roomrental.location.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateLocationRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        String address,

        @Size(max = 30)
        String phone,

        @NotBlank
        @Size(max = 64)
        String timeZone
) {
}