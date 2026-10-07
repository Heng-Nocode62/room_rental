package com.heng.roomrental.security.authentication.service;

import com.heng.roomrental.security.authentication.enity.EmailVerificationOtp;
import com.heng.roomrental.security.authentication.repository.EmailVerificationOtpRepository;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import com.heng.roomrental.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationOtpRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    @Transactional
    public void sendOtp(String email) {

        String otp = generateOtp();

        otpRepository.deleteByEmail(email);

        EmailVerificationOtp verificationOtp =
                EmailVerificationOtp.builder()
                        .email(email)
                        .otp(otp)
                        .expiresAt(OffsetDateTime.now().plusMinutes(5))
                        .createdAt(OffsetDateTime.now())
                        .verified(false)
                        .attempts(0)
                        .build();

        otpRepository.save(verificationOtp);

        emailService.sendVerificationOtp(email, otp);
        log.info("Email verification has been sent to {}", email);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {

        EmailVerificationOtp verificationOtp =
                otpRepository
                        .findTopByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                        .orElseThrow(() ->
                                new RuntimeException("OTP not found"));

        if (verificationOtp.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (verificationOtp.getAttempts() >= 5) {
            throw new RuntimeException("Too many attempts");
        }

        if (!verificationOtp.getOtp().equals(otp)) {

            verificationOtp.setAttempts(
                    verificationOtp.getAttempts() + 1
            );

            otpRepository.save(verificationOtp);

            throw new RuntimeException("Invalid OTP");
        }

        verificationOtp.setVerified(true);
        otpRepository.save(verificationOtp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);

        userRepository.save(user);
    }
}