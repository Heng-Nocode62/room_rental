package com.heng.roomrental.user.dto;

import jakarta.validation.constraints.*;

public record CreateUserRequest(

        @NotBlank
        @Size(max = 100)
        String username,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @Email
        @Size(max = 255)
        String email,

        @Size(max = 30)
        String phone,
        @NotNull
        @Min(0)
        Long roleId
) {
}