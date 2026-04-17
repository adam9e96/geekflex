package com.geekflex.app.auth.service;

import com.geekflex.app.auth.dto.LoginRequest;
import com.geekflex.app.auth.dto.LoginResponse;
import com.geekflex.app.common.security.jwt.JwtTokenProvider;
import com.geekflex.app.user.service.UserIpLogService;
import com.geekflex.app.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private UserIpLogService userIpLogService;

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private Authentication authentication;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                jwtTokenProvider,
                refreshTokenService,
                userIpLogService,
                userService
        );
    }

    @Test
    @DisplayName("로그인 성공 시 액세스 토큰을 반환하고 리프레시 토큰을 저장 및 쿠키로 설정한다")
    void login_returnsAccessTokenAndPersistsRefreshToken() {
        // 인증 성공 후 토큰 발급, 저장, 로그인 IP 기록이 모두 수행되어야 한다.
        LoginRequest loginRequest = LoginRequest.builder()
                .username("adam")
                .password("password123!")
                .build();
        UserDetails userDetails = User.withUsername("adam").password("encoded").roles("USER").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtTokenProvider.generateAccessToken("adam")).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken("adam")).thenReturn("refresh-token");
        when(userService.findUserIdByUsername("adam")).thenReturn(7L);

        LoginResponse loginResponse = authService.login(loginRequest, request, response);

        assertThat(loginResponse.getAccessToken()).isEqualTo("access-token");
        verify(refreshTokenService).saveOrUpdate("adam", "refresh-token", 7L);
        verify(userService).findUserIdByUsername("adam");
        verify(userIpLogService).log(7L, request);

        ArgumentCaptor<String> cookieCaptor = ArgumentCaptor.forClass(String.class);
        verify(response).addHeader(eq("Set-Cookie"), cookieCaptor.capture());
        assertThat(cookieCaptor.getValue()).contains("refreshToken=refresh-token");
        assertThat(cookieCaptor.getValue()).contains("HttpOnly");
        assertThat(cookieCaptor.getValue()).contains("Secure");
        assertThat(cookieCaptor.getValue()).contains("SameSite=Strict");
        assertThat(cookieCaptor.getValue()).contains("Path=/");
    }

    @Test
    @DisplayName("로그인 시 인증 매니저에 사용자명과 비밀번호를 전달한다")
    void login_authenticatesWithUsernamePasswordToken() {
        // 인증 요청에 로그인 입력값이 그대로 사용되어야 한다.
        LoginRequest loginRequest = LoginRequest.builder()
                .username("adam")
                .password("secret!")
                .build();
        UserDetails userDetails = User.withUsername("adam").password("encoded").roles("USER").build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtTokenProvider.generateAccessToken("adam")).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken("adam")).thenReturn("refresh-token");
        when(userService.findUserIdByUsername("adam")).thenReturn(1L);

        authService.login(loginRequest, request, response);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getPrincipal()).isEqualTo("adam");
        assertThat(tokenCaptor.getValue().getCredentials()).isEqualTo("secret!");
    }

    @Test
    @DisplayName("리프레시 토큰 삭제 쿠키를 설정한다")
    void deleteRefreshTokenCookie_setsExpiredCookieHeader() {
        // 로그아웃 시 브라우저가 쿠키를 지우도록 만료 쿠키를 내려야 한다.
        authService.deleteRefreshTokenCookie(response);

        ArgumentCaptor<String> cookieCaptor = ArgumentCaptor.forClass(String.class);
        verify(response).addHeader(eq("Set-Cookie"), cookieCaptor.capture());
        assertThat(cookieCaptor.getValue()).contains("refreshToken=");
        assertThat(cookieCaptor.getValue()).contains("Max-Age=0");
        assertThat(cookieCaptor.getValue()).contains("HttpOnly");
        assertThat(cookieCaptor.getValue()).contains("Secure");
        assertThat(cookieCaptor.getValue()).contains("SameSite=Strict");
    }
}
