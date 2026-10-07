package com.heng.roomrental.security.authentication.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
