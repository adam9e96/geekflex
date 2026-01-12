package com.geekflex.app.service;

import com.geekflex.app.dto.content.ContentResponse;
import com.geekflex.app.dto.tmdb.MovieDetailResponse;
import com.geekflex.app.dto.tmdb.TvDetailResponse;
import com.geekflex.app.entity.Content;
import com.geekflex.app.entity.ContentType;
import com.geekflex.app.entity.TagType;

import java.util.List;

public interface ContentService {
    List<ContentResponse> getContentsByTagType(TagType tagType);
    /**
     * TMDB_ID로 콘텐츠를 조회하되, 없으면 TMDB에서 받아서 DB에 저장 후 반환
     * → 리뷰 작성 시 필수 기능
     */
    MovieDetailResponse getMovieDetailWithCaching(Long tmdbId, String language);

    /**
     * TV 상세 정보 조회 (캐싱 포함)
     */
    TvDetailResponse getTvDetailWithCaching(Long tmdbId, String language);

    Content getOrCreateContent(Long tmdbId, ContentType contentType);
}
