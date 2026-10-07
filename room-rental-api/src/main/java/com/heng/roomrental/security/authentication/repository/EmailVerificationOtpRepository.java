package com.heng.roomrental.security.authentication.repository;

import com.heng.roomrental.security.authentication.enity.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {

    Optional<EmailVerificationOtp> findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(
            String email
    );

    void deleteByEmail(String email);
}