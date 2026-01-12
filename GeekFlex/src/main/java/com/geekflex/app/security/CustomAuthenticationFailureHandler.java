package com.geekflex.app.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Log4j2
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        log.info("로그인 실패 핸들러 호출됨");
        log.info("예외 타입: {}", exception.getClass().getSimpleName());
        log.info("예외 메시지: {}", exception.getMessage());

        String msg = "";
        String errorMsg = exception.getMessage();

        String type = "error";

        if (exception instanceof UsernameNotFoundException) {
            type = "userId";
            msg = errorMsg + "아이디를 찾을 수 없습니다.";
            log.warn("사용자를 찾을 수 없음: {}", errorMsg);
        } else if (exception instanceof BadCredentialsException) {
            type = "password";
            msg = "비밀번호가 일치하지 않습니다.";
            log.warn("비밀번호가 일치하지 않음");
        }
        
        log.info("에러 페이지로 리다이렉트: /error?type={}&msg={}", type, msg);
        response.sendRedirect("/error?type="+java.net.URLEncoder.encode(type, StandardCharsets.UTF_8)
                + "&msg=" + java.net.URLEncoder.encode(msg, StandardCharsets.UTF_8));
    }
}
