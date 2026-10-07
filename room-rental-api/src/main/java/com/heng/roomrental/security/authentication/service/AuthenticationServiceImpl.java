package com.heng.roomrental.security.authentication.service;

import com.heng.roomrental.permission.entity.Permission;
import com.heng.roomrental.role.entity.Role;
import com.heng.roomrental.role.repository.RoleRepository;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.security.authentication.dto.*;
import com.heng.roomrental.security.jwt.JwtService;
import com.heng.roomrental.security.refresh.*;
import com.heng.roomrental.user.dto.UserResponse;
import com.heng.roomrental.user.entity.User;
import com.heng.roomrental.user.entity.UserStatus;
import com.heng.roomrental.user.mapper.UserMapper;
import com.heng.roomrental.user.repository.UserRepository;
import com.heng.roomrental.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenHashService tokenHashService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CurrentUserService currentUserService;
    private final NavigationService navigationService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    @Override
    @Transactional
    public AuthenticationResult login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.email(),
                                request.password()
                        )
                );

        UserPrincipal principal =
                (UserPrincipal)
                        authentication.getPrincipal();
        User user = principal.getUser();
        if (!user.isEmailVerified()) {
            throw new BadCredentialsException("Invalid credentials");
        }
        String accessToken = jwtService.generateAccessToken(principal);


        String refreshToken = refreshTokenService.create(user);

        return new AuthenticationResult(
                accessToken,
                refreshToken,
                "Bearer",
                900
        );
    }

    @Override
    @Transactional
    public AuthenticationResult refresh(String rawRefreshToken) {

        String hash = tokenHashService.hash(rawRefreshToken);

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHash(hash)
                        .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (refreshToken.getRevokedAt() != null) {

            throw new BadCredentialsException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadCredentialsException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        UserPrincipal principal = UserPrincipal.from(user);

        String newAccessToken = jwtService.generateAccessToken(principal);

        return new AuthenticationResult(
                newAccessToken,
                rawRefreshToken,
                "Bearer",
                900
        );
    }
    @Override
    public UserResponse me(){
        User user = currentUserService.getCurrentUserDetails();
        return userMapper.toResponse(user);
    }

    @Override
    public AuthMeResponse authMe() {

        User user = currentUserService.getCurrentUserDetails();
        UserResponse userResponse = userMapper.toResponse(user);

        Set<String> permissionCodes = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getCode)
                .collect(Collectors.toSet());

        String primaryRole = resolvePrimaryRole(user);

        List<NavigationResponse> navigation =
                navigationService.getNavigation(permissionCodes);

        return new AuthMeResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus().name(),
                userResponse.roles(),
                navigation
        );
    }

    private String resolvePrimaryRole(User user) {
        Set<String> names = user.getRoles().stream()
                .map(Role::getName)                 // ADJUST: your role-name getter
                .collect(Collectors.toSet());

        if (names.contains("ADMIN")) return "ADMIN";
        if (names.contains("OWNER")) return "OWNER";
        if (names.contains("STAFF")) return "STAFF";
        return "USER";
    }

    @Override
    @Transactional(readOnly = true)
    public void logout(String rawRefreshToken) {

        String hash = tokenHashService.hash(rawRefreshToken);

        refreshTokenRepository
                .findByTokenHash(hash)
                .ifPresent(token -> {

                    token.setRevokedAt(
                            OffsetDateTime.now()
                    );
                });
    }

    @Transactional
    public User findOrCreateGoogleUser(String sub, String email, String givenName, String familyName) {
        Optional<User> bySub = userRepository.findByGoogleSubWithRoles(sub);
        if (bySub.isPresent()) {
            return bySub.get();
        }

        Optional<User> byEmail = userRepository.findByEmailWithRoles(email);
        if (byEmail.isPresent()) {
            User existing = byEmail.get();
            if (existing.isEmailVerified()) {
                existing.setGoogleSub(sub);
                return userRepository.save(existing);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists. Log in with your password first, then link Google.");
        }

        User user = new User();
        user.setEmail(email);
        user.setGoogleSub(sub);
        user.setUsername(generateUniqueUsername(email));
        user.setFirstName(givenName != null ? givenName : "");
        user.setLastName(familyName != null ? familyName : "");
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);   // match whatever your enum's active value is
        user.setPasswordHash(null);

        Role defaultRole = roleRepository.findByCodeWithPermissions("USER")
                .orElseThrow(() -> new IllegalStateException("Default role USER not found"));
        user.setRoles(new HashSet<>(Set.of(defaultRole)));
        return userRepository.save(user);
    }

    private String generateUniqueUsername(String email) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9._-]", "");
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }
}