package com.heng.roomrental.security.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationOtp(String email, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("Verify your email");
        message.setText("""
                Hello,

                Your verification code is:

                %s

                This code will expire in 5 minutes.

                If you did not create an account, please ignore this email.
                """.formatted(otp));

        mailSender.send(message);
    }
}