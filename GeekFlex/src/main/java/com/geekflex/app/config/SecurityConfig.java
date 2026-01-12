package com.geekflex.app.config;

import com.geekflex.app.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "http://192.168.0.42:5037",
                "http://192.168.50.218:5037",
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:5037",
                "http://192.168.50.153:8070",
                "http://localhost:8070",
                "http://192.168.0.42:8070"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // 특정 HTTP 요청에 대한 웹 기반 보안 구성
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // 기본 인증 기능 OFF (JWT에서는 반드시 OFF)
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                // 커스텀 AuthenticationProvider 등록 (AuthenticationProviderImpl 가 호출됨)
                .authenticationProvider(authenticationProvider) // 로그인 시 발생하는 인증 로직. JWT 인증과는 별개
                // 로그인 하지않고 들어오는 요청중 헤더에 토큰이 있는 요청은 전부 처리 (JWT 필터 설정)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // 접근 권한 설정
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/user/me").authenticated() // 마이페이지 (이건 인증 필요)
                        .requestMatchers("/api/v1/user/summary").authenticated()
                        .requestMatchers("/", "/user/login", "/user/signup").permitAll()
                        .requestMatchers("/api/v1/user/**").authenticated()
                        .requestMatchers("/api/v1/likes/**").permitAll() // 좋아요 요청
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/v1/reviews/**").permitAll()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().authenticated() // 기 외 모든 요청은 인증 필요
                )
                // 요청마다 JWT로 인증
                // 서버에서 세션 유지를 하지 않음
                // 인증 실패/권한 부족 발생 시
                // GlobalExceptionHandler 로 넘김
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 예외 처리 핸들러 설정
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authEx) -> {
                            throw authEx; // 인증 실패 -> GlobalExceptionHandler 로 전달
                        })
                        .accessDeniedHandler((req, res, accessEx) -> {
                            throw accessEx; // 권한 없음 -> GlobalExceptionHandler 로 전달
                        })
                );
        return http.build();
    }
}
