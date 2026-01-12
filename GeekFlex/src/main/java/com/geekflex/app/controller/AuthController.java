package com.geekflex.app.controller;

import com.geekflex.app.dto.LoginRequest;
import com.geekflex.app.dto.LoginResponse;
import com.geekflex.app.security.jwt.JwtTokenProvider;
import com.geekflex.app.service.AuthService;
import com.geekflex.app.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 로그인
     *
     * @param loginRequest 아이디, 비밀번호 Request
     * @return response {accessToken} 반환 (refreshToken은 HttpOnly 쿠키로 전달)
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest,HttpServletRequest request, HttpServletResponse response) {
        LoginResponse tokenResponse = authService.login(loginRequest,request, response);
        return ResponseEntity.ok(tokenResponse);
    }

    /**
     * 로그아웃 요청 처리
     * refreshToken 쿠키 삭제 및 무효화
     */
    @PostMapping("/logout")
    public void logout(@AuthenticationPrincipal UserDetails user, HttpServletResponse response) {
        // 1. DB에 저장된 refreshToken 삭제
        refreshTokenService.deleteByUsername(user.getUsername());
        // 2. 쿠키 무효화
        authService.deleteRefreshTokenCookie(response);
    }


    /**
     * 토큰 갱신
     * refreshToken 쿠키로 검증 후 새로운 accessToken 발급
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(HttpServletRequest request) {
        String refreshToken = jwtTokenProvider.extractRefreshTokenFromCookie(request);

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = jwtTokenProvider.getUsername(refreshToken);

        // DB에 저장된 refresh token 일치 여부 확인
        if (!refreshTokenService.isValid(username, refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 새 access token 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(username);

        // refreshToken은 쿠키에 이미 있으므로 DTO에 포함하지 않음
        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(newAccessToken)
                .build());
    }
}