package com.geekflex.app.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * JwtTokenProvider
 * --------------------------------------------------------
 * ✔ 역할 요약:
 * 1) AccessToken / RefreshToken 생성
 * 2) JWT 서명 검증 + 만료 검증
 * 3) JWT 의 subject(username) 추출
 * 4) JWT 로부터 Authentication(UserDetails 기반) 생성
 * <p>
 * ✔ JWT 인증의 핵심 로직을 가진 클래스.
 * <p>
 * ✔ AccessToken: Authorization 헤더로 API 요청 인증
 * ✔ RefreshToken: DB + 쿠키에 저장하여 토큰 재발급용
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final UserDetailsService userDetailsService;
    private final JwtProperties jwtProperties;

    private SecretKey key;

    // secretKey 문자열 → HMAC 암호화 키 변환
    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(jwtProperties.getSecretKey().getBytes(StandardCharsets.UTF_8));
    }

    // AccessToken 생성
    public String generateAccessToken(String username) {
        return buildToken(username, jwtProperties.getAccessTokenExpiration());
    }

    // RefreshToken 생성
    public String generateRefreshToken(String username) {
        return buildToken(username, jwtProperties.getRefreshTokenExpiration());
    }

    // 공통 토큰 생성 로직
    private String buildToken(String username, long expiryMilliseconds) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiryMilliseconds);

        // 사용자 권한(UserDetailsService 통해 조회 필요)
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);


        return Jwts.builder()
                .issuer(jwtProperties.getIssuer())
                .subject(username)
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList()
                )
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    // JWT 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT 토큰 만료: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("JWT 검증 실패: {}", e.getMessage());
        }
        return false;
    }

    // 사용자 아이디 추출
    public String getUsername(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    // JWT → Authentication 변환
    public Authentication getAuthentication(String token) {
        try {
            String username = getUsername(token);
            log.info("JWT에서 추출된 username = {}", username);

            //반드시 UserDetailsService로 실제 유저 객체를 가져와야 함
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // principal을 UserDetails 객체로 넣는다.
            return new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

        } catch (Exception e) {
            log.error("❌ JWT 인증 객체 생성 실패: {}", e.getMessage(), e);
            return null;
        }
    }

    public String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
