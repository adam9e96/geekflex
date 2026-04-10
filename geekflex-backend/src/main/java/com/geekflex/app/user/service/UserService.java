package com.geekflex.app.user.service;

import com.geekflex.app.user.dto.*;
import com.geekflex.app.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {

    User saveUser(User user);

    User registerUser(UserJoinRequest joinRequest);

    /** 회원가입 처리 (유저 저장 + 프로필 이미지 업로드) */
    UserDetailResponse signup(UserJoinRequest joinRequest, MultipartFile profileImage) throws IOException;

    User findUserEntity(String username);

    UserInfoResponse getUserProfile(String username);

    String uploadProfileImage(User user, MultipartFile file) throws IOException;

    Long findUserIdByUsername(String username);

    UserSummaryResponse getUserInfoSummary(String username);

    /** publicId로 프로필 조회 (리뷰 통계 포함) */
    UserProfileResponse getUserProfileWithStats(String publicId);

    /** publicId로 사용자 상세 정보 조회 (리뷰 목록, 컬렉션 목록 포함) */
    UserInfoDetailResponse getUserInfoDetail(String publicId);

    UserInfoResponse updateUser(String username, UserUpdateRequest request, MultipartFile profileImage) throws IOException;

    void deleteUser(String username, UserDeleteRequest request) throws IOException;

    void verifyPassword(String username, String password);

    UserIdCheckResponse checkUserIdAvailability(String userId);

}







