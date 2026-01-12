package com.geekflex.app.security;

import com.geekflex.app.entity.User;
import com.geekflex.app.exception.SocialLoginOnlyException;
import com.geekflex.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * UserDetailsServiceImpl
 * --------------------------------------------------------
 * ✔ 역할: username(ID/이메일)로 사용자 정보를 DB에서 조회하여
 * Spring Security 규격의 UserDetails 형태로 반환.
 * <p>
 * ✔ AuthenticationProviderImpl 이 로그인 인증 시 호출하는 핵심 클래스.
 * <p>
 * ✔ DB 엔티티(User)를 그대로 쓰지 않고,
 * UserDetailsImpl 로 감싸서 SecurityContext 에 저장할 수 있는 형태로 변환.
 * <p>
 * ✔ 소셜 로그인 유저(비밀번호 없음) 제어도 이곳에서 처리.
 */
@Service
@Log4j2
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        log.info("2. UserDetailsService - loadUserByUsername({}) 호출", username);

        // username 또는 email 로 사용자 조회
        User user = userRepository.findByUserIdOrUserEmail(username, username)
                .orElseThrow(() -> {
                    log.warn("사용자를 찾을 수 없습니다: {}", username);
                    return new UsernameNotFoundException("아이디/이메일 또는 비밀번호를 확인하세요.");
                });

        log.info("✔ 사용자 조회 성공: {} (nickname={})", username, user.getNickname());

        // 소셜 로그인 계정은 일반 로그인 불가
        if (user.getPassword() == null) {
            throw new SocialLoginOnlyException("소셜 로그인 사용자는 일반 로그인을 사용할 수 없습니다.");
        }
        // 다 통과 시 UserDetails 객체 반환
        // User 엔티티 → UserDetailsImpl 변환
        return new UserDetailsImpl(user);
    }
}
