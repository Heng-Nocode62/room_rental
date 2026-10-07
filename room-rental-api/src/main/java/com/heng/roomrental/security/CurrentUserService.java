package com.heng.roomrental.security;

import com.heng.roomrental.user.repository.UserRepository;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;
    public User getCurrentUser(
            Authentication authentication
    ) {

        Jwt jwt =
                (Jwt) authentication.getPrincipal();

        Long userId =
                Long.valueOf(
                        jwt.getSubject()
                );

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists"
                        )
                );
    }

    public User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "No authenticated user."
            );
        }

        Object principal =
                authentication.getPrincipal();

        Long userId;

        if (principal instanceof Jwt jwt) {

            userId = Long.valueOf(
                    jwt.getSubject()
            );

        } else if (principal instanceof String value) {

            userId = Long.valueOf(value);

        } else {

            throw new IllegalStateException(
                    "Unsupported authentication principal: "
                            + principal.getClass().getName()
            );
        }

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists."
                        )
                );
    }
    @Transactional(readOnly = true)
    public User getCurrentUserDetails() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "No authenticated user."
            );
        }

        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long userId =
                Long.valueOf(
                        jwt.getSubject()
                );

        return userRepository.findWithRolesAndPermissionsById(
                        userId
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user no longer exists."
                        )
                );

    }
}