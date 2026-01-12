package com.geekflex.app.dto.user;

import lombok.*;

/**
 * 실시간 아이디 중복 검사 응답 DTO
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserIdCheckResponse {

    /**
     * 아이디
     */
    private String userId;

    /**
     * 사용 가능 여부
     * true: 사용 가능, false: 중복 또는 사용 불가
     */
    private boolean available;

    /**
     * 메시지
     */
    private String message;
}

