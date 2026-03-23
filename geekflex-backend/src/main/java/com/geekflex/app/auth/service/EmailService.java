package com.geekflex.app.auth.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Log4j2
@Transactional
@Service
@RequiredArgsConstructor
public class EmailService {

    private final WebClient resendWebClient;
    private final StringRedisTemplate redisTemplate;

    @Value("${resend.from-email:GeekFlex <onboarding@resend.dev>}")
    private String fromEmail;

    private static final long VERIFICATION_CODE_TTL_MINUTES = 5;

    public void sendVerificationCode(String toEmail) {
        // 1. 인증번호 생성 (6자리 난수)
        String code = generateVerificationCode();

        // 2. Redis 저장 (TTL 5분)
        redisTemplate.opsForValue().set(
                "email:verification:" + toEmail,
                code,
                VERIFICATION_CODE_TTL_MINUTES,
                TimeUnit.MINUTES);

        // 3. 이메일 전송
        String title = "[GeekFlex] 이메일 인증 코드입니다.";
        String content = "<h1>이메일 인증 코드</h1>" +
                "<br>" +
                "아래 인증 코드를 입력하여 이메일 인증을 완료해주세요." +
                "<br><br>" +
                "<h2>" + code + "</h2>" +
                "<br>" +
                "인증 코드는 " + VERIFICATION_CODE_TTL_MINUTES + "분간 유효합니다.";

        sendEmail(toEmail, title, content);
    }

    public boolean verifyCode(String email, String code) {
        String storedCode = redisTemplate.opsForValue().get("email:verification:" + email);
        return storedCode != null && storedCode.equals(code);
    }

    private String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }

    public void sendEmail(String toEmail, String title, String content) {
        Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", new String[]{toEmail},
                "subject", title,
                "html", content
        );

        String response = resendWebClient.post()
                .uri("/emails")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        log.info("Resend 이메일 전송 완료: to={}, response={}", toEmail, response);
    }
}
