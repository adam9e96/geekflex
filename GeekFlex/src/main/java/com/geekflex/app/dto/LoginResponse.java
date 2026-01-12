package com.geekflex.app.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponse {
    private String accessToken;
    // refreshToken은 HttpOnly 쿠키로만 전달 (보안상 DTO에 포함하지 않음)
}