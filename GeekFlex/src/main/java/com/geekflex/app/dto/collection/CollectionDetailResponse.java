package com.geekflex.app.dto.collection;

import com.geekflex.app.dto.UserSummaryResponse;
import com.geekflex.app.dto.content.ContentResponse;
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
}