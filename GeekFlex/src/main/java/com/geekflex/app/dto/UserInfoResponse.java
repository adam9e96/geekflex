package com.geekflex.app.dto;

import com.geekflex.app.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@Setter
public class UserInfoResponse {

    private String publicId;            // 외부 공개용 ULID
    private String userId;              // 일반 로그인 ID (소셜 로그인 시 null)
    private String nickname;            // 닉네임
    private String userEmail;           // 이메일
    private String profileImage;        // 프로필 이미지 URL
    private String bio;                 // 자기소개
    private LocalDate birthDate;        // 생년월일
    private int activityScore;          // 활동 점수
    private String role;                // 권한 (USER / ADMIN 등)
    private boolean termsAgreement;     // 이용약관 동의 여부
    private boolean marketingAgreement; // 마케팅 정보 수신 동의 여부
    private LocalDateTime joinedAt;     // 가입일시
    private LocalDateTime updatedAt;    // 수정일시
    private String oauthProvider;       // 소셜 로그인 제공자 (예: google, naver)
    private String oauthId;             // 소셜 로그인 고유 ID

    public static UserInfoResponse from(User user) {
        return UserInfoResponse.builder()
                .publicId(user.getPublicId())
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .userEmail(user.getUserEmail())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .birthDate(user.getBirthDate())
                .activityScore(user.getActivityScore())
                .role(user.getRole().name())
                .termsAgreement(user.isTermsAgreement())
                .marketingAgreement(user.isMarketingAgreement())
                .joinedAt(user.getJoinedAt())
                .updatedAt(user.getUpdatedAt())
                .oauthProvider(user.getOauthProvider())
                .oauthId(user.getOauthId())
                .build();
    }
}