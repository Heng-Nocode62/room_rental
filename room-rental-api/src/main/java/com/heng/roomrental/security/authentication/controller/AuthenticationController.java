package com.heng.roomrental.security.authentication.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.service.ReservationService;
import com.heng.roomrental.security.authentication.dto.*;
import com.heng.roomrental.security.authentication.security.RefreshTokenCookie;
import com.heng.roomrental.security.authentication.service.AuthenticationService;
import com.heng.roomrental.security.jwt.JwtService;
import com.heng.roomrental.security.refresh.RefreshTokenService;
import com.heng.roomrental.user.dto.ChangePasswordRequest;
import com.heng.roomrental.security.authentication.dto.ForgotPasswordRequest;
import com.heng.roomrental.security.authentication.dto.ResetPasswordRequest;
import com.heng.roomrental.security.authentication.dto.UpdateProfileRequest;
import com.heng.roomrental.security.authentication.dto.MessageResponse;
import com.heng.roomrental.user.dto.UpdateUserRequest;
import com.heng.roomrental.user.dto.UserResponse;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final GoogleIdTokenVerifier googleVerifier;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final ReservationService reservationService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthenticationResult result = authenticationService.login(request);

        ResponseCookie refreshCookie =
                RefreshTokenCookie.create(result.refreshToken());

        LoginResponse response = new LoginResponse(
                result.accessToken(),
                result.tokenType(),
                result.expiresIn()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(
                    name = RefreshTokenCookie.NAME,
                    required = false
            ) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token missing"
            );
        }

        AuthenticationResult result =
                authenticationService.refresh(refreshToken);
        ResponseCookie refreshCookie =
                RefreshTokenCookie.create(result.refreshToken());

        LoginResponse response = new LoginResponse(
                result.accessToken(),
                result.tokenType(),
                result.expiresIn()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(
                    name = RefreshTokenCookie.NAME,
                    required = false
            ) String refreshToken
    ) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            authenticationService.logout(refreshToken);
        }

        ResponseCookie deleteCookie = RefreshTokenCookie.delete();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(
            @RequestBody GoogleAuthRequest request
    ) throws GeneralSecurityException, IOException {
        log.info("api hit");
        GoogleIdToken idToken = googleVerifier.verify(request.credential());
        if (idToken == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid Google token"
            );
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Google email not verified"
            );
        }

        User user = authenticationService.findOrCreateGoogleUser(
                payload.getSubject(),
                payload.getEmail(),
                (String) payload.get("given_name"),
                (String) payload.get("family_name")
        );

        String accessToken =
                jwtService.generateAccessToken(UserPrincipal.from(user));

        String refreshToken = refreshTokenService.create(user);

        ResponseCookie refreshCookie =
                RefreshTokenCookie.create(refreshToken);

        AuthResponse response = new AuthResponse(
                accessToken,
                "Bearer",
                300L
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @GetMapping("/me")
    public AuthMeResponse me() {
        return authenticationService.authMe();
    }

    @PutMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid
            @RequestBody
            ChangePasswordRequest request
    ) {

        authenticationService.changePassword(request
        );
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authenticationService.requestPasswordReset(request);
        return ResponseEntity.ok(new MessageResponse(
                "If an eligible account exists for that email, a password reset code has been sent."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(authenticationService.updateMyProfile(request));
    }

    @GetMapping("/me/reservations")
    public List<ReservationResponse> getMyReservation() {
        return reservationService.getMyReservations();
    }
}
