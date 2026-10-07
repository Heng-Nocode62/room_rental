package com.heng.roomrental.security.authentication.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
