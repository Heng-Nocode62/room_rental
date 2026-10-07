package com.heng.roomrental.security.refresh;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Transactional
    @Query("""
        UPDATE RefreshToken r
        SET r.revokedAt = :now
        WHERE r.user.id = :userId
          AND r.revokedAt IS NULL
        """)
    int revokeAllByUserId(
            @Param("userId")
            Long userId,

            @Param("now")
            OffsetDateTime now
    );
}