package com.geekflex.app.auth.service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.concurrent.TimeUnit;

@Log4j2
@Transactional
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;
    private final StringRedisTemplate redisTemplate;

    private static final long VERIFICATION_CODE_TTL_MINUTES = 5;

    public void sendVerificationCode(String toEmail) throws MessagingException {
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
        return String.valueOf((int) (Math.random() * 900000) + 100000); // 100000 ~ 999999
    }

    public void sendEmail(String toEmail, String title, String content) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(toEmail);
        helper.setSubject(title);
        helper.setText(content, true); // true를 설정해서 HTML을 사용 가능하게 함
        helper.setReplyTo("qwertyqwerty33j3j@gmail.com"); // 회신 불가능한 주소 설정

        try {
            emailSender.send(message);
        } catch (RuntimeException e) {
            e.printStackTrace(); // 또는 로거를 사용해 상세한 예외 정보 로깅
            throw new RuntimeException("이메일 전송 수 없음", e);
        }
    }

    // 기존 단순 메일 발송 로직 유지 (필요시)
    public SimpleMailMessage createEmailForm(String toEmail, String title, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(title);
        message.setText(text);
        return message;
    }
}








