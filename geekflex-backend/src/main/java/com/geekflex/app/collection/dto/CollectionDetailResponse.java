package com.geekflex.app.collection.dto;

import com.geekflex.app.collection.entity.Collection;
import com.geekflex.app.content.dto.ContentResponse;
import com.geekflex.app.user.dto.UserSummaryResponse;
import com.geekflex.app.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean isPublic;
    private Integer viewCount;
    private Long likeCount;
    private Boolean isLiked;
    private Boolean isOwner; // 현재 사용자가 소유자인지
    private UserSummaryResponse author;
    private List<ContentResponse> items; // 포함된 작품 목록
    private List<CollectionCommentResponse> comments; // 댓글 목록
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Collection 엔티티와 상세 데이터로부터 응답 DTO를 생성합니다. */
    public static CollectionDetailResponse from(Collection collection, User author, Long currentUserId,
                                                 Long likeCount, Boolean isLiked,
                                                 List<ContentResponse> items,
                                                 List<CollectionCommentResponse> comments) {
        return CollectionDetailResponse.builder()
                .id(collection.getId())
                .title(collection.getTitle())
                .description(collection.getDescription())
                .isPublic(collection.getIsPublic())
                .viewCount(collection.getViewCount())
                .likeCount(likeCount)
                .isLiked(isLiked)
                .isOwner(collection.getUserId().equals(currentUserId))
                .author(UserSummaryResponse.from(author))
                .items(items)
                .comments(comments)
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }
}







