package com.geekflex.app.dto;

public record JwtDto(
        String accessToken,
        String refreshToken) {
}
