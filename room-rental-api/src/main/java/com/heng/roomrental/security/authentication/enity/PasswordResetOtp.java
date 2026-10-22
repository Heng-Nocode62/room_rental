package com.heng.roomrental.security.authentication.enity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "password_reset_otps", indexes = {
        @Index(name = "idx_password_reset_otp_email_created", columnList = "email, created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254)
    private String email;

    // Store a password-encoder hash, never the raw OTP.
    @Column(name = "otp_hash", nullable = false, length = 100)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private int attempts;

    @Column(nullable = false)
    private boolean used;
}
