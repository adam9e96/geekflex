package com.geekflex.app.repository;

import com.geekflex.app.entity.Role;
import com.geekflex.app.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;


    // 암호화 X 저장 테스트
    @Test
    @DisplayName("회원 저장이 정상적으로 이루어지는지 테스트")
    public void saveUserTest() {
        String uniqueId = java.util.UUID.randomUUID().toString().substring(0, 8);
        // Given
        User user = User.builder()
                .userId("ac0105_" + uniqueId)
                .password("passw1115")
                .userEmail("dogo1115_" + uniqueId + "@gmail.com")
                .nickname("dogo15_" + uniqueId)
                .role(Role.USER)
                .bio("안녕하시오.")
                .build();

        // When
        User savedUser = userRepository.save(user);

        // Then
        System.out.println(savedUser);
    }

    // 암호화 O 저장 테스트
    @Test
    @DisplayName("회원 저장이 정상적으로 이루어지는지 테스트- 암호화O")
    public void saveUserTest2() {
        String uniqueId = java.util.UUID.randomUUID().toString().substring(0, 8);
        // Given
        User user = User.builder()
                .userId("ac0107_" + uniqueId)
                .password("passw1117")
                .userEmail("dogo1117_" + uniqueId + "@gmail.com")
                .nickname("dogo17_" + uniqueId)
                .role(Role.USER)
                .bio("안녕하시오.2")
                .build();

        // When
        User savedUser = userRepository.save(user);

        // Then
        System.out.println(savedUser);

    }

    @Test
    @DisplayName("아이디로 유저 조회")
    void findUserByIdTest() {
        String userId = "faker";
        Optional<User> userOpt = userRepository.findByUserIdOrUserEmail(userId, userId);

        userOpt.ifPresent(user -> System.out.println("찾은 유저: " + user));
    }

    @Test
    @DisplayName("이메일로 유저 조회")
    void findUserByEmailTest() {
        String email = "faker@lck.kr";
        Optional<User> userOpt = userRepository.findByUserIdOrUserEmail(email, email);

        userOpt.ifPresent(user -> System.out.println("찾은 유저: " + user));
    }

}