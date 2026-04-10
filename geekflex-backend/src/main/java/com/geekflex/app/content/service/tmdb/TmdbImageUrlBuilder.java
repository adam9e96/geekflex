package com.geekflex.app.content.service.tmdb;

import lombok.NoArgsConstructor;

/**
 * TMDB api에서 응답받은 이미지의 상대 경로를 절대 URL로 변환해 주는 유틸리티 클래스
 * 공식 문서:
 * - Image basics: https://developer.themoviedb.org/docs/image-basics
 * - Configuration API (base_url, size 정보 조회): https://developer.themoviedb.org/reference/configuration-details
 */
@NoArgsConstructor
public final class TmdbImageUrlBuilder {

    private static final String TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
    private static final String TMDB_POSTER_SIZE = "w500"; // 세로 포스터용
    private static final String TMDB_BACKDROP_SIZE = "w1280"; // 가로 배경용

    // 포스터 이미지 생성 (poster)
    // 세로형 포스터 이미지 생성에 적합한 URL 반환
    public static String poster(String path) {
        return build(path, TMDB_POSTER_SIZE);
    }

    // 배경 이미지 생성 (backdrop)
    // 가로형 배경 이미지에 적합한 URL 반환
    public static String backdrop(String path) {
        return build(path, TMDB_BACKDROP_SIZE);
    }

    // 이미지가 없을때 (이미지 서버 문제가 발생한 경우) null 반환하여 프론트에서 처리
    private static String build(String path, String size) {
        if (path == null || path.isBlank()) {
            return null;
        }
        if (path.startsWith("http")) {
            return path;
        }

        return TMDB_IMAGE_BASE_URL + "/" + size + path;
    }
}
