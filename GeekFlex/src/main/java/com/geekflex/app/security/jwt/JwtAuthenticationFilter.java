package com.geekflex.app.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter
 * ----------------------------------------------------------
 * ✔ Spring Security에서 "JWT 인증 1단계"를 담당하는 필터.
 * - 매 요청마다 실행되며 (OncePerRequestFilter)
 * - Authorization 헤더에서 JWT를 꺼내고
 * - 유효성 검사 후
 * - 토큰이 정상이면 Authentication 객체를 생성해
 * SecurityContextHolder에 저장한다.
 * <p>
 * ✔ 즉 "JWT → UserDetails 변환 → Authentication 생성 → SecurityContext 저장"
 * 이 모든 과정을 담당하는 핵심 인증 필터.
 * <p>
 * 🚫 주의: 이 필터는 로그인 자체를 처리하지 않는다.
 * ✔ 로그인 시 JWT 발급은 AuthController 등에서 처리하고,
 * ✔ 필터는 그 후의 모든 요청에서 토큰의 유효성을 검사하여
 * 해당 사용자가 정상적으로 인증된 사용자임을 확인하는 역할이다.
 * <p>
 * shouldNotFilter() 를 통해 로그인/회원가입 등
 * 토큰이 필요 없는 엔드포인트는 필터를 건너뛰도록 설정함.
 */
@Log4j2
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider; // JWT 생성/검증/Authentication 생성 유틸리티


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
//        log.info("JWT 인증 필터 실행");


        // 1) Authorization 헤더에서 Bearer 토큰 추출
        String header = request.getHeader("Authorization");
//        log.info("   ➤ Authorization 헤더: {}", header);

        String token = null;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7); // 'Bearer ' 이후의 JWT 순수 토큰 부분
        }

        // 2) 토큰이 존재하고 유효한 경우 → Authentication 생성 후 SecurityContext에 저장
        if (token != null && jwtTokenProvider.validateToken(token)) {

            // Claims 에서 username(또는 userId) 추출
//            String username = jwtTokenProvider.getUsername(token);

            // UsernamePasswordAuthenticationToken으로 인증 객체 생성
            Authentication auth = jwtTokenProvider.getAuthentication(token);

            if (auth != null) {
                // SecurityContextHolder 에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(auth);
//                log.info("SecurityContext 인증 정보 설정 완료: {}", auth.getName());
            } else {
                log.warn("Authentication 생성 실패 → 인증 실패 처리");
            }
        }
        // 3) 나머지 필터 및 컨트롤러로 요청 전달
        filterChain.doFilter(request, response);
    }

    /**
     * shouldNotFilter
     * ----------------------------------------------------------
     * 이 메서드는 "특정 URL은 JWT 인증 필터를 적용하지 않도록" 제외하는 역할.
     * <p>
     * 보통 로그인(/login), 회원가입(/signup) 등
     * 토큰이 필요 없는 엔드포인트에서 필터가 동작하지 않도록 한다.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // 예: 로그인/회원가입 엔드포인트는 필터 적용 안 함
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/login") 
                || path.startsWith("/api/v1/auth/refresh")
                || path.startsWith("/api/v1/signup");
    }

}
