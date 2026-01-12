package com.geekflex.app.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class SecurityConfigTest {

    @Autowired
    PasswordEncoder passwordEncoder;
    @Test
    void testPwdEncoder() {
        String encoded = passwordEncoder.encode("password12345");
        System.out.println(encoded); // 인코드된 비밀번호 // {bcrypt}$2a$10$PlMEl5jNKIqC33Q9Yok.6evWG2MzBHURY8XmmlHFQjHmL8Z7P6/Wq
    }

    @Test
    void testPwdMatch() {

        String encoded = "{bcrypt}$2a$10$PlMEl5jNKIqC33Q9Yok.6evWG2MzBHURY8XmmlHFQjHmL8Z7P6/Wq";
        boolean ok = passwordEncoder.matches("password12345", encoded);
        System.out.println(ok ? "일치" : "불일치");

    }
}