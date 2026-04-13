package com.geekflex.app.collection.dto;

import com.geekflex.app.collection.entity.Collection;
import com.geekflex.app.user.dto.UserSummaryResponse;
import com.geekflex.app.user.entity.User;
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
    private String thumbnailUrl;
    private Long coverContentId;
    private Integer viewCount;
    private Integer itemCount; // 포함된 작품 수
    private Long likeCount; // 좋아요 수
    private Boolean isLiked; // 현재 사용자가 좋아요 했는지
    private UserSummaryResponse author; // 작성자 정보
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Collection 엔티티와 집계 데이터로부터 응답 DTO를 생성합니다. */
    public static CollectionResponse from(Collection collection, User author,
                                          String thumbnailUrl,
                                          int itemCount, Long likeCount, Boolean isLiked) {
        return CollectionResponse.builder()
                .id(collection.getId())
                .title(collection.getTitle())
                .description(collection.getDescription())
                .isPublic(collection.getIsPublic())
                .thumbnailUrl(thumbnailUrl)
                .coverContentId(collection.getCoverContentId())
                .viewCount(collection.getViewCount())
                .itemCount(itemCount)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .author(UserSummaryResponse.from(author))
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }
}







