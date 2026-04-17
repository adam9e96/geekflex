package com.geekflex.app.auth.service;

import com.geekflex.app.auth.entity.RefreshToken;
import com.geekflex.app.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
    }

    @Test
    @DisplayName("기존 토큰이 없으면 새 리프레시 토큰을 저장한다")
    void saveOrUpdate_savesNewTokenWhenTokenDoesNotExist() {
        // 신규 로그인 사용자는 새 RefreshToken 엔티티가 생성되어야 한다.
        when(refreshTokenRepository.findByUsername("adam")).thenReturn(Optional.empty());

        refreshTokenService.saveOrUpdate("adam", "new-token", 7L);

        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getUsername()).isEqualTo("adam");
        assertThat(tokenCaptor.getValue().getRefreshToken()).isEqualTo("new-token");
        assertThat(tokenCaptor.getValue().getExpiryDate()).isAfter(LocalDateTime.now().plusDays(6));
    }

    @Test
    @DisplayName("기존 토큰이 있으면 값을 갱신해서 다시 저장한다")
    void saveOrUpdate_updatesExistingTokenWhenTokenExists() {
        // 동일 사용자의 토큰은 새 엔티티를 만들지 않고 기존 엔티티를 갱신한다.
        RefreshToken existingToken = RefreshToken.builder()
                .id(1L)
                .username("adam")
                .refreshToken("old-token")
                .expiryDate(LocalDateTime.now().minusDays(1))
                .build();
        when(refreshTokenRepository.findByUsername("adam")).thenReturn(Optional.of(existingToken));

        refreshTokenService.saveOrUpdate("adam", "updated-token", 7L);

        verify(refreshTokenRepository).save(existingToken);
        assertThat(existingToken.getRefreshToken()).isEqualTo("updated-token");
        assertThat(existingToken.getExpiryDate()).isAfter(LocalDateTime.now().plusDays(6));
    }

    @Test
    @DisplayName("저장된 토큰이 일치하고 만료되지 않았으면 유효하다고 판단한다")
    void isValid_returnsTrueWhenTokenMatchesAndIsNotExpired() {
        // username으로 찾은 토큰이 동일하고 만료 전이면 true여야 한다.
        when(refreshTokenRepository.findByUsername("adam"))
                .thenReturn(Optional.of(refreshToken("adam", "valid-token", LocalDateTime.now().plusDays(1))));

        boolean result = refreshTokenService.isValid("adam", "valid-token");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("저장된 토큰이 없거나 값이 다르거나 만료되었으면 유효하지 않다")
    void isValid_returnsFalseWhenTokenIsMissingMismatchedOrExpired() {
        // 토큰 문자열 불일치와 만료 상태는 모두 false여야 한다.
        when(refreshTokenRepository.findByUsername("adam"))
                .thenReturn(Optional.of(refreshToken("adam", "saved-token", LocalDateTime.now().plusDays(1))));

        assertThat(refreshTokenService.isValid("adam", "other-token")).isFalse();

        when(refreshTokenRepository.findByUsername("adam"))
                .thenReturn(Optional.of(refreshToken("adam", "saved-token", LocalDateTime.now().minusMinutes(1))));

        assertThat(refreshTokenService.isValid("adam", "saved-token")).isFalse();
    }

    @Test
    @DisplayName("토큰 문자열로 조회하면 해당 엔티티를 반환한다")
    void findByToken_returnsTokenWhenPresent() {
        // refresh token 문자열로 저장된 엔티티를 조회할 수 있어야 한다.
        RefreshToken refreshToken = refreshToken("adam", "valid-token", LocalDateTime.now().plusDays(1));
        when(refreshTokenRepository.findByRefreshToken("valid-token")).thenReturn(Optional.of(refreshToken));

        RefreshToken result = refreshTokenService.findByToken("valid-token");

        assertThat(result).isSameAs(refreshToken);
    }

    @Test
    @DisplayName("토큰 문자열로 조회되지 않으면 null을 반환한다")
    void findByToken_returnsNullWhenMissing() {
        // 현재 구현은 Optional 대신 null을 반환한다.
        when(refreshTokenRepository.findByRefreshToken("missing-token")).thenReturn(Optional.empty());

        RefreshToken result = refreshTokenService.findByToken("missing-token");

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("validate는 토큰이 존재하고 만료 전이면 true를 반환한다")
    void validate_returnsTrueWhenTokenExistsAndNotExpired() {
        // 토큰 단독 검증은 조회 후 만료 여부만 판단한다.
        when(refreshTokenRepository.findByRefreshToken("valid-token"))
                .thenReturn(Optional.of(refreshToken("adam", "valid-token", LocalDateTime.now().plusHours(1))));

        boolean result = refreshTokenService.validate("valid-token");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("validate는 토큰이 없거나 만료되었으면 false를 반환한다")
    void validate_returnsFalseWhenTokenMissingOrExpired() {
        // 조회 결과 없음과 만료 상태를 모두 false로 처리해야 한다.
        when(refreshTokenRepository.findByRefreshToken("missing-token")).thenReturn(Optional.empty());
        assertThat(refreshTokenService.validate("missing-token")).isFalse();

        when(refreshTokenRepository.findByRefreshToken("expired-token"))
                .thenReturn(Optional.of(refreshToken("adam", "expired-token", LocalDateTime.now().minusSeconds(1))));
        assertThat(refreshTokenService.validate("expired-token")).isFalse();
    }

    @Test
    @DisplayName("사용자명으로 리프레시 토큰을 삭제한다")
    void deleteByUsername_deletesTokenByUsername() {
        // 로그아웃 시 해당 사용자의 저장된 refresh token을 제거해야 한다.
        refreshTokenService.deleteByUsername("adam");

        verify(refreshTokenRepository).deleteByUsername("adam");
    }

    private RefreshToken refreshToken(String username, String token, LocalDateTime expiryDate) {
        return RefreshToken.builder()
                .username(username)
                .refreshToken(token)
                .expiryDate(expiryDate)
                .build();
    }
}
