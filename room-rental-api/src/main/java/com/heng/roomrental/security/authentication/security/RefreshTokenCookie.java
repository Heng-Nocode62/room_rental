package com.heng.roomrental.security.authentication.security;

import org.springframework.http.ResponseCookie;

import java.time.Duration;

public final class RefreshTokenCookie {

    public static final String NAME = "refresh_token";
    public static final String PATH = "/api/v1/auth";

    private static final Duration MAX_AGE = Duration.ofDays(7);

    private RefreshTokenCookie() {
    }

    public static ResponseCookie create(String refreshToken) {
        return ResponseCookie.from(NAME, refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(PATH)
                .maxAge(MAX_AGE)
                .build();
    }

    public static ResponseCookie delete() {
        return ResponseCookie.from(NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path(PATH)
                .maxAge(Duration.ZERO)
                .build();
    }
}
