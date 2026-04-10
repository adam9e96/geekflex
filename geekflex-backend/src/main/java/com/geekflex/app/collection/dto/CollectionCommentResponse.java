package com.geekflex.app.collection.dto;

import com.geekflex.app.collection.entity.CollectionComment;
import com.geekflex.app.user.dto.UserSummaryResponse;
import com.geekflex.app.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionCommentResponse {
    private Long id;
    private String content;
    private UserSummaryResponse author;
    private Boolean isOwner; // 현재 사용자가 작성자인지
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** CollectionComment 엔티티와 작성자 정보로부터 댓글 응답 DTO를 생성합니다. */
    public static CollectionCommentResponse from(CollectionComment comment, User author, Long currentUserId) {
        return CollectionCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(UserSummaryResponse.from(author))
                .isOwner(comment.getUserId().equals(currentUserId))
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}







