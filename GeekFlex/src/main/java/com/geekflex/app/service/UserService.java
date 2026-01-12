package com.geekflex.app.service;

import com.geekflex.app.dto.UserDeleteRequest;
import com.geekflex.app.dto.UserJoinRequest;
import com.geekflex.app.dto.UserInfoResponse;
import com.geekflex.app.dto.UserSummaryResponse;
import com.geekflex.app.dto.UserUpdateRequest;
import com.geekflex.app.dto.user.UserIdCheckResponse;
import com.geekflex.app.dto.user.UserProfileResponse;
import com.geekflex.app.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

// 엔티티 노출은 최소화 하기
// 최대한 DTO를 통해 전달
public interface UserService {

    // 아주 간단한
    User saveUser(User user);

    // 회원 가입
    User registerUser(UserJoinRequest joinRequest);


    // 내부 로직용 → 반드시 User 엔티티
    User findUserEntity(String username);

    // 프로필용(UserInfo 조회) → DTO
    UserInfoResponse getUserProfile(String username);
//    UserProfileResponse findByUsername(String username);

//    User findByUsername(String username);
//    UserSummaryResponse getUserInfoSummary(String username);

    String uploadProfileImage(User user, MultipartFile file) throws IOException;

    // userDetails.getUsername() 으로 PK 찾아야 할 때
    Long findUserIdByUsername(String username);

    UserSummaryResponse getUserInfoSummary(String username);

    UserProfileResponse getUserProfileByPublicId(String publicId);

    // 회원 정보 수정
    UserInfoResponse updateUser(String username, UserUpdateRequest request, MultipartFile profileImage) throws IOException;

    // 회원 탈퇴
    void deleteUser(String username, UserDeleteRequest request) throws IOException;

    void verifyPassword(String username, String password);

    // 실시간 아이디 중복 검사
    UserIdCheckResponse checkUserIdAvailability(String userId);

}