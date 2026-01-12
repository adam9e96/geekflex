package com.geekflex.app.like.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikeStatusResponse {

    // 현재 로그인한 유저가 이 타겟에 좋아요를 눌렀는지 여부
    private boolean liked;
}

