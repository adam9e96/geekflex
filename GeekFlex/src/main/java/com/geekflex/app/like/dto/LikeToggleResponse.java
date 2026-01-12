package com.geekflex.app.like.dto;

import com.geekflex.app.like.entity.TargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeToggleResponse {

    private boolean liked; // 현재 좋아요 상태 (true: 좋아요됨, false: 좋아요 취소됨)
    private Long targetId; // 타겟 ID (리뷰/댓글 ID 등)
    private TargetType targetType; // 타겟 타입 (REVIEW, COMMENT 등)
}

