package com.geekflex.app.dto.user;


import com.geekflex.app.review.dto.UserReviewStatsDto;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String publicId; // 외부 공개용 ULID
    private String nickname; // 닉네임
    private String bio; // 자기소개
    private LocalDateTime joinedAt; // 가입일시
    private String profileImage;

    private UserReviewStatsDto userReviewStats;
}
