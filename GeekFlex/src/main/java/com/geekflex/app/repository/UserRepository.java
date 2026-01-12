package com.geekflex.app.repository;

import com.geekflex.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, UserRepositoryCustom {

    boolean existsByUserId(String userId); // id 중복검사

    boolean existsByUserEmail(String userEmail); // userEmail 중복검사

    // 아이디 OR 이메일로 계정 조회
    Optional<User> findByUserIdOrUserEmail(String userId, String userEmail);

    //
    Optional<User> findByPublicId(String publicId);

    boolean existsByNickname(String nickname);

    Optional<User> findByUserId(String userId);

}
