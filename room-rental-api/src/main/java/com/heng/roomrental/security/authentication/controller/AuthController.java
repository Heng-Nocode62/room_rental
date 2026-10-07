package com.heng.roomrental.security.authentication.controller;

import com.heng.roomrental.security.authentication.dto.RegisterRequest;
import com.heng.roomrental.security.authentication.dto.ResendOtpRequest;
import com.heng.roomrental.security.authentication.dto.VerifyEmailRequest;
import com.heng.roomrental.security.authentication.service.EmailVerificationService;
import com.heng.roomrental.security.authentication.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        registrationService.register(request);

        return ResponseEntity.ok(
                "Registration successful. Please check your email for the OTP."
        );
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @RequestBody VerifyEmailRequest request
    ) {

        emailVerificationService.verifyOtp(
                request.email(),
                request.otp()
        );

        return ResponseEntity.ok(
                "Email verified successfully."
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody ResendOtpRequest request
    ) {
        emailVerificationService.sendOtp(
                request.email()
        );
        return ResponseEntity.ok(
                "A new OTP has been sent to your email."
        );
    }
}