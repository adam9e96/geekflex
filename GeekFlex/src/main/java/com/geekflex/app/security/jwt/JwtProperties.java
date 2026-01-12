package com.geekflex.app.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 관련 설정값을 application.properties에서 주입받는 클래스
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "jwt") // jwt. 로시작하는 설정값을 자동으로 바인딩
public class JwtProperties {
    private String secretKey;
    private long accessTokenExpiration;
    private long refreshTokenExpiration;
    private String issuer;
}
