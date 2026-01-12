package com.geekflex.app.dto.collection;

import com.geekflex.app.dto.UserSummaryResponse;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean isPublic;
    private Integer viewCount;
    private Integer itemCount; // 포함된 작품 수
    private Long likeCount; // 좋아요 수
    private Boolean isLiked; // 현재 사용자가 좋아요 했는지
    private UserSummaryResponse author; // 작성자 정보
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}