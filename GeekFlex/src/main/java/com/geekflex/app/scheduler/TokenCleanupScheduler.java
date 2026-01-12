package com.geekflex.app.scheduler;

import com.geekflex.app.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    // 매일 10시마다 실행
    @Transactional
    @Scheduled(cron = "0 0 10 * * *", zone = "Asia/Seoul")
    public void cleanExpiredTokens() {
        log.info("만료된 토큰 삭제 실행");
        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        log.info("[TOKEN CLEANUP]  삭제된 만료 토큰  개수 : {}", deletedCount);
    }
}
