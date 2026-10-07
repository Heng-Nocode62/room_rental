package com.heng.roomrental.security.jwt;

import com.heng.roomrental.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    public String generateAccessToken(UserPrincipal user) {

        Instant now = Instant.now();

        List<String> authorities =
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList();

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .subject(user.getUserId().toString())
                        .issuedAt(now)
                        .expiresAt(
                                now.plusMillis(
                                        properties.accessTokenExpiration()
                                )
                        )
                        .claim(
                                "username",
                                user.getUsername()
                        )
                        .claim(
                                "authorities",
                                authorities
                        )
                        .build();

        JwsHeader header =
                JwsHeader
                        .with(MacAlgorithm.HS256)
                        .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }
}