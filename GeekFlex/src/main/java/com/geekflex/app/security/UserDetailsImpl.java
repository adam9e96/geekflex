package com.geekflex.app.security;

import com.geekflex.app.entity.Role;
import com.geekflex.app.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


/**
 * UserDetailsImpl
 * ---------------------------------------------
 * Spring Security가 "로그인한 사용자"를 표현하는 표준 인터페이스가 UserDetails.
 * <p>
 * 이 클래스는 실제 DB 엔티티(User)를 감싸서
 * 스프링 시큐리티가 이해할 수 있는 사용자 정보 형태로 변환해주는 어댑터(Wrapper) 역할을 한다.
 * <p>
 * 즉, DB Entity(User) → Security UserDetails 로 변환하는 단계.
 * SecurityContext에 저장되는 것은 항상 User (엔티티)가 아니라, UserDetails 구현체임.
 */
public class UserDetailsImpl implements UserDetails {
    /**
     * 실제 DB의 User 엔티티를 보관.
     * - 비밀번호, 권한, 사용자명 등을 UserDetails 규격에 맞게 꺼내기 위한 용도.
     */
    private final User user;

    public UserDetailsImpl(User user) {
        this.user = user;
    }

    /**
     * getAuthorities()
     * ---------------------------------------------
     * 사용자에게 부여된 "권한 목록"을 반환한다.
     * 스프링 시큐리티는 인가(authorization) 처리 시, 이 권한값을 가지고
     * 특정 요청을 허용할지 말지 판단한다.
     * <p>
     * - Role.USER → "ROLE_USER"
     * - Role.ADMIN → "ROLE_ADMIN" 등으로 매핑되는 구조가 일반적.
     * <p>
     * 여기서는 Role.USER만 보유한 단일 권한 구조.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        // 사용자의 Role 값에 따라 GrantedAuthority 생성
        if (user.getRole().equals(Role.USER)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        // 필요 시 ROLE_ADMIN 등도 추가 가능
        return authorities;
    }


    /**
     * getPassword()
     * ---------------------------------------------
     * Spring Security가 "로그인 패스워드 비교"할 때 사용.
     * 반드시 암호화된 상태(BCrypt 등)여야 한다.
     */
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    /**
     * getUsername()
     * ---------------------------------------------
     * Spring Security가 사용자를 식별할 때 사용하는 "로그인 ID".
     * 주로 username, email, userId 등 인증 기준이 되는 속성을 반환한다.
     * <p>
     * 여기서는 getUserId()를 username으로 사용.
     */
    @Override
    public String getUsername() {
        return user.getUserId();
    }
}
