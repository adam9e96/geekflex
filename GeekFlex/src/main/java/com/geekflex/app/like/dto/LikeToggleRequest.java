package com.geekflex.app.like.dto;

import com.geekflex.app.like.entity.TargetType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeToggleRequest {
    
    @NotNull(message = "targetType은 필수입니다.")
    private TargetType targetType;
    
    @NotNull(message = "targetId는 필수입니다.")
    private Long targetId; // content_id 여야한다.
}

