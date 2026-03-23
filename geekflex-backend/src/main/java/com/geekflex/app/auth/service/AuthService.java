package com.geekflex.app.auth.service;

import com.geekflex.app.auth.dto.LoginRequest;
import com.geekflex.app.auth.dto.LoginResponse;
import com.geekflex.app.common.security.jwt.JwtTokenProvider;
import com.geekflex.app.user.service.UserIpLogService;
import com.geekflex.app.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long REFRESH_TOKEN_DAYS = 7;

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserIpLogService userIpLogService;
    private final UserService userService;

    public LoginResponse login(LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        UserDetails userDetails = authenticate(loginRequest);

        String accessToken = jwtTokenProvider.generateAccessToken(loginRequest.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getUsername());

        persistRefreshToken(userDetails.getUsername(), refreshToken);
        attachRefreshTokenCookie(response, refreshToken, REFRESH_TOKEN_DAYS);
        logLoginIp(userDetails.getUsername(), request);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public void deleteRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private UserDetails authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        return (UserDetails) authentication.getPrincipal();
    }

    private void persistRefreshToken(String username, String refreshToken) {
        refreshTokenService.saveOrUpdate(username, refreshToken, REFRESH_TOKEN_DAYS);
    }

    private void attachRefreshTokenCookie(HttpServletResponse response, String refreshToken, long maxAgeDays) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(maxAgeDays))
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void logLoginIp(String username, HttpServletRequest request) {
        long userId = userService.findUserIdByUsername(username);
        userIpLogService.log(userId, request);
    }
}
