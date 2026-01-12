package com.geekflex.app.dto;

import com.geekflex.app.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserDetailResponse {
    String publicId;
    String userId;
    String nickname;
    Role role;
    int activityScore;
    String userEmail;
    String profileImage;
    String bio;
    LocalDateTime joinedAt;
}
