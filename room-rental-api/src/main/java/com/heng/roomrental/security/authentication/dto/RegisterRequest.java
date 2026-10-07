package com.heng.roomrental.security.authentication.dto;

public record RegisterRequest(
        String email,
        String password,
        String firstName,
        String lastName
) {
}