package com.heng.roomrental.security.authentication.dto;

public record VerifyEmailRequest(
        String email,
        String otp
) {
}