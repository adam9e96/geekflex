package com.geekflex.app.content.dto.movie;

import com.querydsl.core.annotations.QueryProjection;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * @param id          DB PK (Nullable, TMDB 검색 시 없음)
 * @param tmdbId      TMDB 고유 ID
 * @param posterUrl   TMDB: poster_path
 * @param backdropUrl TMDB: backdrop_path
 */
public record MovieSearchResponse(Long id, Long tmdbId, String title, String originalTitle, String overview,
                                  LocalDate releaseDate, String posterUrl, String backdropUrl, BigDecimal popularity,
                                  BigDecimal voteAverage, Integer voteCount) {

    /**
     * DB 조회(QueryDSL) 전용 생성자
     * - id 있음
     */
    @QueryProjection
    public MovieSearchResponse {
    }

    /**
     * TMDB 검색 API 전용 생성자
     * - id = null
     */
    public MovieSearchResponse(
            Long tmdbId,
            String title,
            String originalTitle,
            String overview,
            LocalDate releaseDate,
            String posterUrl,
            String backdropUrl,
            BigDecimal popularity,
            BigDecimal voteAverage,
            Integer voteCount
    ) {
        this(null, tmdbId, title, originalTitle, overview, releaseDate, posterUrl, backdropUrl, popularity, voteAverage, voteCount);
    }
}








