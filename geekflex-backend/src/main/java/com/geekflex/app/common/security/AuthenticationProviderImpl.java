package com.geekflex.app.common.security;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthenticationProviderImpl
 * --------------------------------------------------------
 * ✔ 역할: "로그인 시도(username/password)"가 들어오면
 * 아이디/비밀번호를 검증하여 인증을 수행하는 클래스.
 * <p>
 * ✔ Spring Security 로그인 인증 절차에서 동작:
 * UsernamePasswordAuthenticationFilter
 * → AuthenticationManager
 * → AuthenticationProvider(여기)
 * → UserDetailsService
 * → PasswordEncoder
 * → 인증 성공 시 Authentication 반환
 * <p>
 * ✔ 이 Provider는 ID/PW 기반 인증만 담당하고,
 * API 요청 시 JWT로 인증하는 과정은 JwtAuthenticationFilter가 처리함.
 * <p>
 * 정리:
 * 로그인 시 = AuthenticationProviderImpl
 * 요청 인증 시 = JwtAuthenticationFilter
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class AuthenticationProviderImpl implements AuthenticationProvider {
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;


    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String userName = (String) authentication.getPrincipal();
        String password = (String) authentication.getCredentials();

        UserDetails userDetails = userDetailsService.loadUserByUsername(userName);

        if (passwordEncoder.matches(password, userDetails.getPassword())) {
            return new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
        } else {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

    }

    @Override
    public boolean supports(Class<?> authentication) {
        // UsernamePasswordAuthenticationToken 타입 인증만 처리
        return authentication.equals(UsernamePasswordAuthenticationToken.class);

    }
}








