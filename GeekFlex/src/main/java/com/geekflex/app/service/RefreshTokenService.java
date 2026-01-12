package com.geekflex.app.service;

import com.geekflex.app.entity.RefreshToken;
import com.geekflex.app.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    // 저장 또는 갱신
    public void saveOrUpdate(String username, String newToken, long daysToExpire) {
        LocalDateTime expiry = LocalDateTime.now().plusDays(daysToExpire);

        refreshTokenRepository.findByUsername(username).ifPresentOrElse(
                existing -> {
                    existing.update(newToken);
                    existing.setExpiryDate(expiry);
                    refreshTokenRepository.save(existing);
                },
                () -> {
                    RefreshToken token = RefreshToken.builder()
                            .username(username)
                            .refreshToken(newToken)
                            .expiryDate(expiry)
                            .build();
                    refreshTokenRepository.save(token);
                }
        );
    }
    public boolean isValid(String username, String token) {
        return refreshTokenRepository.findByUsername(username)
                .filter(rt -> rt.getRefreshToken().equals(token) && !rt.isExpired())
                .isPresent();
    }
    // 토큰으로 조회
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByRefreshToken(token).orElse(null);
    }

    // 유효성 검사
    public boolean validate(String token) {
        RefreshToken refreshToken = findByToken(token);
        return refreshToken != null && !refreshToken.isExpired();
    }

    // 사용자별 삭제
    @Transactional
    public void deleteByUsername(String username) {
        refreshTokenRepository.deleteByUsername(username);
    }
}