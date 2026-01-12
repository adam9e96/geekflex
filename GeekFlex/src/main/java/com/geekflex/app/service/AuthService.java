package com.geekflex.app.service;

import com.geekflex.app.dto.LoginRequest;
import com.geekflex.app.dto.LoginResponse;
import com.geekflex.app.security.jwt.JwtTokenProvider;
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

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserIpLogService userIpLogService;
    private final UserService userService;


    public LoginResponse login(LoginRequest loginRequest, HttpServletRequest request,HttpServletResponse response) {

        // 1) ID/PW 기반 인증 수행
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 인증 성공 후 사용자 정보 추출
        UserDetails user = (UserDetails) authentication.getPrincipal(); // id 이메일추출임

        // JWT 토큰 생성
        // 2) 인증 성공 시 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(loginRequest.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getUsername());

        // key: username
        // value: refreshToken
        // exp : 7
        // 3) RefreshToken 저장 (DB)
        refreshTokenService.saveOrUpdate(user.getUsername(), refreshToken, 7);

        // 4) RefreshToken 쿠키 저장
        // HttpOnly 쿠키로 발급
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        long userId = userService.findUserIdByUsername(user.getUsername());

        userIpLogService.log(userId, request);

        // 5) 응답 (refreshToken은 쿠키로만 전달)
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

}