package com.geekflex.app.repository;

import com.geekflex.app.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUsername(String username);

    Optional<RefreshToken> findByRefreshToken(String refreshToken);

    void deleteByUsername(String username);


    // 만료일 기준으로 삭제 (반환값 = 삭제된 row 수)
    int deleteByExpiryDateBefore(LocalDateTime now);

}