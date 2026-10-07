package com.heng.roomrental.security.refresh;

import com.heng.roomrental.security.jwt.JwtProperties;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private final TokenHashService tokenHashService;

    private final JwtProperties jwtProperties;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Transactional
    public String create(User user) {

        byte[] randomBytes =
                new byte[64];

        secureRandom.nextBytes(randomBytes);

        String rawToken =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);

        refreshToken.setTokenHash(
                tokenHashService.hash(rawToken)
        );


        refreshToken.setExpiresAt(
                OffsetDateTime.now()
                        .plus(jwtProperties.refreshTokenExpiration(), ChronoUnit.MILLIS)
        );

        refreshTokenRepository.save(
                refreshToken
        );

        return rawToken;
    }

    @Transactional
    public int revokeAllForUser(
            Long userId
    ) {

        return refreshTokenRepository
                .revokeAllByUserId(
                        userId,
                        OffsetDateTime.now()
                );
    }
}