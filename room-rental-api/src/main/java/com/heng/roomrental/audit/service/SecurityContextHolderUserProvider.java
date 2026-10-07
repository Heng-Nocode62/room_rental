package com.heng.roomrental.audit.service;

import com.heng.roomrental.user.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityContextHolderUserProvider implements AuditUserProvider {
    @Override
    public Optional<Long> getUserId() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        try {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            if (jwt == null) {
                return Optional.empty();
            }
            Long userId = Long.valueOf(jwt.getSubject());
            return Optional.of(userId);
        }catch (Exception e){
            return Optional.empty();
        }
    }
}
