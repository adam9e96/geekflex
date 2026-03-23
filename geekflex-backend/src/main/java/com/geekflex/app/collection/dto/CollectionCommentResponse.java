package com.geekflex.app.collection.dto;
import com.geekflex.app.user.dto.UserSummaryResponse;
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
}







