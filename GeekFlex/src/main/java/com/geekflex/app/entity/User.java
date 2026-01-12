package com.geekflex.app.entity;

import com.github.f4b6a3.ulid.UlidCreator;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// 복합 유니크, 테이블 이름 설정
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"oauth_provider", "oauth_id"})
        }
)
@ToString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 내부용 PK

    @Column(name = "public_id", length = 26, nullable = false, unique = true)
    private String publicId; // 외부 노출용 ULID

    @Column(name = "user_id", length = 50)
    private String userId; // 일반 로그인 ID (소셜은 null)

    @Column(length = 100)
    private String password; // 비밀번호 (소셜은 null)

    @Column(name = "nickname", length = 50, nullable = false, unique = true)
    private String nickname; // 닉네임

    @Column(length = 20, nullable = false)
    private Role role; // 유저권한

    @Column(name = "activity_score")
    private int activityScore; // 활동점수

    @Column(name = "user_email", length = 100, nullable = false, unique = true)
    private String userEmail; // 이메일

    @Column(name = "profile_image", length = 255)
    private String profileImage; // 프로필 이미지

    @Column(length = 300)
    private String bio; // 자기소개

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "terms_agreement", nullable = false)
    private boolean termsAgreement; // 이용약관 동의 여부

    @Column(name = "marketing_agreement")
    private boolean marketingAgreement; // 마케팅 정보 수신 동의 여부

    @Column(name = "joined_at", nullable = false, unique = false)
    private LocalDateTime joinedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @Column(name = "oauth_provider", length = 30)
    private String oauthProvider; // 소셜 제공자

    @Column(name = "oauth_id", length = 100)
    private String oauthId; // 소셜 고유 ID

    @PrePersist
    public void prePersist() {
        if (this.publicId == null) {
            this.publicId = UlidCreator.getUlid().toString(); // 시간 기반 ULID 생성
        }
        this.joinedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 회원 수정 시 발생
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}