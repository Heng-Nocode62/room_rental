package com.heng.roomrental.security.authentication.dto;

/**
 * Internal authentication result.
 *
 * The refresh token is intentionally kept out of the HTTP response DTOs.
 * AuthenticationController places it in an HttpOnly cookie instead.
 */
public record AuthenticationResult(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn
) {
}
