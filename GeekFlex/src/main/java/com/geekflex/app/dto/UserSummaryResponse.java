package com.geekflex.app.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private String nickname;
    private String profileImage;
    private String userId;
}
